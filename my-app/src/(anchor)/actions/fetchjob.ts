import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../setup';
import { WalletContextState } from '@solana/wallet-adapter-react';

// Type definitions
export type JobStatus = 'all' | 'open' | 'inProgress' | 'completed' | 'cancelled' | 'disputed';
export type ClientFilter = 'all' | 'my' | PublicKey;

export interface JobAccount {
  authority: PublicKey;
  client: PublicKey;
  freelancer: PublicKey | null;
  title: string;
  description: string;
  budget: number;
  deadline: number;
  status: {
    open?: object;
    inProgress?: object;
    completed?: object;
    cancelled?: object;
    disputed?: object;
  };
  createdAt: number;
  updatedAt: number;
}

export interface Job {
  publicKey: PublicKey;
  account: JobAccount;
}

export interface FetchJobsOptions {
  clientFilter?: ClientFilter;
  statusFilter?: JobStatus;
  freelancerFilter?: 'all' | PublicKey;
  limit?: number;
}

export const fetchJobs = async (
  wallet: WalletContextState,
  options: FetchJobsOptions = {}
): Promise<Job[]> => {
  try {
    const {
      clientFilter = 'all',
      statusFilter = 'all',
      freelancerFilter = 'all',
      limit
    } = options;

    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const program = getProgram(wallet);
    
    // Step 1: Build filters based on options
    const filters = [];
    
    // Client filter - only add if specified
    if (clientFilter !== 'all') {
      const clientAddress = clientFilter === 'my' ? wallet.publicKey : clientFilter;
      filters.push({
        memcmp: {
          offset: 8, // Skip discriminator (8)
          bytes: clientAddress.toBase58(),
        }
      });
    }
    
    let jobs;
    if (filters.length > 0) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-expect-error
      jobs = await program.account.job.all(filters);
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-expect-error
      jobs = await program.account.job.all();
    }
    
    // Step 3: Apply freelancer filter (client-side)
    if (freelancerFilter !== 'all') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-expect-error
      jobs = jobs.filter(job => {
        // Check if freelancer is assigned and matches
        if (job.account.freelancer) {
          try {
            return job.account.freelancer.equals(freelancerFilter);
          } catch (e) {
            return false;
          }
        }
        return false;
      });
    }
    
    // Step 4: Apply status filter (client-side)
    if (statusFilter !== 'all') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-expect-error
      jobs = jobs.filter(job => {
        const jobStatus = Object.keys(job.account.status)[0].toLowerCase();
        return jobStatus === statusFilter.toLowerCase();
      });
    }
    
    // Step 5: Apply limit if specified
    if (limit && limit > 0) {
      jobs = jobs.slice(0, limit);
    }
    
    // Return clean job data
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-expect-error
    return jobs.map(job => ({
      publicKey: job.publicKey,
      account: job.account
    }));
    
  } catch (error) {
    console.error("❌ Error fetching jobs:", error);
    throw error;
  }
};


export const fetchJobByPublicKey = async (
  wallet: WalletContextState,
  jobPublicKey: PublicKey
): Promise<Job | null> => {
  try {
    const program = getProgram(wallet);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-expect-error
    const jobAccount = await program.account.job.fetch(jobPublicKey);
    
    return {
      publicKey: jobPublicKey,
      account: jobAccount
    };
  } catch (error) {
    console.error("❌ Error fetching job by public key:", error);
    return null;
  }
};

export const fetchJobsByClient = async (
  wallet: WalletContextState,
  clientAddress: PublicKey,
  statusFilter: JobStatus = 'all'
): Promise<Job[]> => {
  return fetchJobs(wallet, {
    clientFilter: clientAddress,
    statusFilter
  });
};

export const fetchMyJobs = async (
  wallet: WalletContextState,
  statusFilter: JobStatus = 'all'
): Promise<Job[]> => {
  return fetchJobs(wallet, {
    clientFilter: 'my',
    statusFilter
  });
};

export const fetchJobsByFreelancer = async (
  wallet: WalletContextState,
  freelancerAddress: PublicKey,
  statusFilter: JobStatus = 'all'
): Promise<Job[]> => {
  return fetchJobs(wallet, {
    freelancerFilter: freelancerAddress,
    statusFilter
  });
};

// NEW: Fetch jobs where freelancer has applied/bid
export const fetchJobsWithFreelancerBids = async (
  wallet: WalletContextState,
  freelancerAddress: PublicKey,
  statusFilter: JobStatus = 'all'
): Promise<Job[]> => {
  try {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const program = getProgram(wallet);
    
    // Fetch all jobs (or filter by status if needed)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-expect-error
    let jobs = await program.account.job.all();
    
    // Filter jobs where freelancer has bid
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-expect-error
    jobs = jobs.filter(job => {
      // Check if freelancer is in bidders array
      if (job.account.bidders && Array.isArray(job.account.bidders)) {
        //@
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return job.account.bidders.some((bidder: any) => {
          try {
            if (bidder.freelancer) {
              return bidder.freelancer.equals(freelancerAddress);
            }
            return false;
          } catch (e) {
            return false;
          }
        });
      }
      
      // Or check if freelancer is assigned
      if (job.account.freelancer) {
        try {
          return job.account.freelancer.equals(freelancerAddress);
        } catch (e) {
          return false;
        }
      }
      
      return false;
    });
    
    // Apply status filter
    if (statusFilter !== 'all') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-expect-error
      jobs = jobs.filter(job => {
        const jobStatus = Object.keys(job.account.status)[0].toLowerCase();
        return jobStatus === statusFilter.toLowerCase();
      });
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-expect-error
    return jobs.map(job => ({
      publicKey: job.publicKey,
      account: job.account
    }));
    
  } catch (error) {
    console.error("❌ Error fetching jobs with freelancer bids:", error);
    throw error;
  }
};

