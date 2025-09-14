"use client"
import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { Button } from "@/app/module/ui/button";

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Crypto Fund Manager",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
      content: "WorkSphere's institutional-grade tools have transformed our trading strategy. The API integration and automated features have opened up countless hours.",
      rating: 5,
      highlight: "API integration"
    },
    {
      name: "David Wilson",
      role: "DeFi Protocol Designer", 
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      content: "The customer support is exceptional, and the platform's intuitive design makes getting started with crypto trading seamless. A game-changer for both beginners and pros.",
      rating: 5,
      highlight: "intuitive design"
    },
    {
      name: "Maria Rodriguez",
      role: "Blockchain Developer",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face", 
      content: "Finally, a trading platform that understands developers. The smart contract integration and real-time data feeds are exactly what we needed.",
      rating: 5,
      highlight: "smart contract integration"
    },
    {
      name: "Alex Chen", 
      role: "Portfolio Manager",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      content: "The risk management tools and portfolio analytics have significantly improved our trading performance. Highly recommended for serious traders.",
      rating: 5,
      highlight: "risk management"
    }
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-neon-gold/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass-panel px-4 py-2 rounded-full mb-6">
            <Quote className="h-4 w-4 text-neon-cyan" />
            <span className="text-sm font-medium text-foreground">Trusted by Traders</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-foreground">Join </span>
            <span className="text-neon bg-gradient-primary bg-clip-text text-transparent">
              Thousands
            </span>
            <br />
            <span className="text-foreground">of Satisfied Traders</span>
          </h2>
          
          <p className="text-xl text-foreground-muted max-w-3xl mx-auto">
            Join thousands of satisfied traders on WorkSphere
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 lg:p-12 relative overflow-hidden">
            {/* Quote Icon */}
            <Quote className="absolute top-6 left-6 h-12 w-12 text-neon-gold/20" />
            
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="flex-shrink-0 relative group">
                <Image
                  src={testimonials[currentIndex].avatar}
                  alt={testimonials[currentIndex].name}
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full border-4 border-gradient-primary group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-20 group-hover:opacity-30 transition-opacity" />
              </div>

              {/* Content */}
              <div className="flex-1 text-center lg:text-left">
                {/* Rating Stars */}
                <div className="flex justify-center lg:justify-start gap-1 mb-4">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-neon-gold fill-neon-gold" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <blockquote className="text-lg lg:text-xl text-foreground mb-6 leading-relaxed">
                  &quot;{testimonials[currentIndex].content}&quot;
                </blockquote>

                {/* Author Info */}
                <div>
                  <h4 className="text-xl font-semibold text-foreground mb-1">
                    {testimonials[currentIndex].name}
                  </h4>
                  <p className="text-foreground-muted">
                    {testimonials[currentIndex].role}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="glass"
                size="icon"
                onClick={prevTestimonial}
                className="hover:border-primary"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              {/* Dots Indicator */}
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentIndex 
                        ? 'bg-primary shadow-neon' 
                        : 'bg-foreground-muted/30 hover:bg-foreground-muted/50'
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="glass"
                size="icon"
                onClick={nextTestimonial}
                className="hover:border-primary"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-6">
            Ready to start trading?
          </h3>
          <p className="text-lg text-foreground-muted mb-8 max-w-2xl mx-auto">
            Join thousands of traders who have already discovered the power of our platform.
          </p>
          <Button variant="neon" size="xl" className="gap-2">
            Create Account
            <Star className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;