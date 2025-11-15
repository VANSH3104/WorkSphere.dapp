import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../setup';
import { WalletContextState } from '@solana/wallet-adapter-react';

// Type definitions
export type JobStatus = 'all' | 'open' | 'inProgress' | 'completed' | 'cancelled' | 'disputed';
export type ClientFilter = 'all' | 'my' | PublicKey;

export interface JobAccount {
  authority: PublicKey;
  client: PublicKey;
  freelancer: PublicKey;
  title: string;
  description: string;
  budget: number;
  deadline: number;
  status: {
    open?: {};
    inProgress?: {};
    completed?: {};
    cancelled?: {};
    disputed?: {};
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
    
    // Client filter
    if (clientFilter !== 'all') {
      const clientAddress = clientFilter === 'my' ? wallet.publicKey : clientFilter;
      filters.push({
        memcmp: {
          offset: 8, // Skip discriminator (8)
          bytes: clientAddress.toBase58(),
        }
      });
    }
    
    // Freelancer filter
    if (freelancerFilter !== 'all') {
      filters.push({
        memcmp: {
          offset: 8 + 32, // Skip discriminator (8) + client (32)
          bytes: freelancerFilter.toBase58(),
        }
      });
    }

    // Step 2: Fetch jobs with filters
    let jobs;
    if (filters.length > 0) {
      jobs = await program.account.job.all(filters);
    } else {
      jobs = await program.account.job.all();
    }
    
    // Step 3: Apply status filter (client-side)
    if (statusFilter !== 'all') {
      jobs = jobs.filter(job => {
        const jobStatus = Object.keys(job.account.status)[0].toLowerCase();
        return jobStatus === statusFilter.toLowerCase();
      });
    }
    
    // Step 4: Apply limit if specified
    if (limit && limit > 0) {
      jobs = jobs.slice(0, limit);
    }
    
    // Return clean job data
    return jobs.map(job => ({
      publicKey: job.publicKey,
      account: job.account
    }));
    
  } catch (error) {
    console.error("❌ Error fetching jobs:", error);
    throw error;
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export const fetchJobByPublicKey = async (
  wallet: WalletContextState,
  jobPublicKey: PublicKey
): Promise<Job | null> => {
  try {
    const program = getProgram(wallet);
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

// ============================================
// USAGE EXAMPLES
// ============================================

/*
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

// Example 1: Fetch ALL jobs
const allJobs = await fetchJobs(wallet);
console.log(`Total jobs: ${allJobs.length}`);

// Example 2: Fetch only OPEN jobs (from all clients)
const openJobs = await fetchJobs(wallet, { statusFilter: 'open' });
console.log(`Open jobs: ${openJobs.length}`);

// Example 3: Fetch MY jobs (any status)
const myJobs = await fetchJobs(wallet, { clientFilter: 'my' });
// OR use helper function:
// const myJobs = await fetchMyJobs(wallet);
console.log(`My jobs: ${myJobs.length}`);

// Example 4: Fetch MY OPEN jobs
const myOpenJobs = await fetchJobs(wallet, { 
  clientFilter: 'my', 
  statusFilter: 'open' 
});
// OR use helper function:
// const myOpenJobs = await fetchMyJobs(wallet, 'open');
console.log(`My open jobs: ${myOpenJobs.length}`);

// Example 5: Fetch DISPUTED jobs from specific client
const clientAddress = new PublicKey('SomePublicKeyHere...');
const disputedJobs = await fetchJobs(wallet, { 
  clientFilter: clientAddress, 
  statusFilter: 'disputed' 
});
// OR use helper function:
// const disputedJobs = await fetchJobsByClient(wallet, clientAddress, 'disputed');
console.log(`Disputed jobs: ${disputedJobs.length}`);

// Example 6: Fetch COMPLETED jobs (all clients)
const completedJobs = await fetchJobs(wallet, { statusFilter: 'completed' });
console.log(`Completed jobs: ${completedJobs.length}`);

// Example 7: Fetch jobs for specific freelancer
const freelancerAddress = new PublicKey('FreelancerPublicKey...');
const freelancerJobs = await fetchJobs(wallet, { 
  freelancerFilter: freelancerAddress 
});
// OR use helper function:
// const freelancerJobs = await fetchJobsByFreelancer(wallet, freelancerAddress);
console.log(`Freelancer jobs: ${freelancerJobs.length}`);

// Example 8: Fetch limited jobs
const recentJobs = await fetchJobs(wallet, { limit: 10 });
console.log(`Recent jobs: ${recentJobs.length}`);

// Example 9: Fetch specific job by public key
const jobPublicKey = new PublicKey('JobPublicKey...');
const specificJob = await fetchJobByPublicKey(wallet, jobPublicKey);
if (specificJob) {
  console.log(`Job title: ${specificJob.account.title}`);
}

// Example 10: Using in a React component
import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

const MyJobsComponent: React.FC = () => {
  const wallet = useWallet();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  
  const loadMyOpenJobs = async () => {
    if (!wallet.publicKey) return;
    
    setLoading(true);
    try {
      const data = await fetchMyJobs(wallet, 'open');
      setJobs(data);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadMyOpenJobs();
  }, [wallet.publicKey]);
  
  if (loading) return <div>Loading jobs...</div>;
  
  return (
    <div>
      <h2>My Open Jobs ({jobs.length})</h2>
      {jobs.map(job => (
        <div key={job.publicKey.toString()}>
          <h3>{job.account.title}</h3>
          <p>{job.account.description}</p>
          <p>Budget: {job.account.budget} SOL</p>
        </div>
      ))}
    </div>
  );
};

// Example 11: Advanced filtering with multiple criteria
const advancedFilteredJobs = await fetchJobs(wallet, {
  clientFilter: 'my',
  statusFilter: 'open',
  limit: 5
});
*/