"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "Vex completely transformed my job search. I went from getting ghosted to landing 5 interviews in my first week. The AI CV optimizer is incredible.",
    name: "Sarah Chen",
    role: "Product Manager",
    company: "Now at Google",
    metric: "5 interviews in 1 week",
    avatar: "SC",
  },
  {
    quote: "The skill gap analysis showed me exactly what I was missing. After completing the recommended courses, my callback rate increased by 300%.",
    name: "Marcus Johnson",
    role: "Software Engineer",
    company: "Now at Stripe",
    metric: "300% more callbacks",
    avatar: "MJ",
  },
  {
    quote: "I was skeptical about auto-apply, but Vex only applied to jobs that truly matched my profile. Quality over quantity, and it worked.",
    name: "Emily Rodriguez",
    role: "Data Scientist",
    company: "Now at Netflix",
    metric: "Hired in 2 weeks",
    avatar: "ER",
  },
  {
    quote: "As a career changer, I had no idea where to start. Vex created a personalized roadmap that made the transition smooth and achievable.",
    name: "David Kim",
    role: "UX Designer",
    company: "Now at Figma",
    metric: "Career change success",
    avatar: "DK",
  },
  {
    quote: "The personalized courses filled gaps I did not even know I had. Within a month, I was confident enough to target senior roles.",
    name: "Priya Patel",
    role: "Engineering Manager",
    company: "Now at Meta",
    metric: "Promoted to senior",
    avatar: "PP",
  },
  {
    quote: "Vex applied to 47 jobs for me while I focused on interview prep. Got 8 offers and negotiated a 40% salary increase.",
    name: "James Wilson",
    role: "Backend Engineer",
    company: "Now at Airbnb",
    metric: "40% salary increase",
    avatar: "JW",
  },
];

export function Testimonials() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section id="testimonials" className="py-20 md:py-32 relative bg-muted/30">
      <div className="max-w-[1200px] mx-auto px-6" ref={containerRef}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-24"
        >
          <span className="text-secondary font-bold text-xs uppercase tracking-[0.3em] mb-6 block">
            Success Stories
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-[900] text-foreground mb-6 md:mb-8 tracking-tighter uppercase leading-none">
            Loved by Thousands of
            <br />
            <span className="text-secondary italic">Successful Job Seekers</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
            Join over 10,000 professionals who landed their dream jobs with Vex.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="bg-card border border-border/10 rounded-3xl p-8 hover:border-primary transition-all duration-500 shadow-xl shadow-black/[0.02] dark:shadow-white/[0.02] group"
            >
              <div className="flex gap-1 mb-8">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-lg text-foreground mb-8 font-medium leading-relaxed italic">&ldquo;{testimonial.quote}&rdquo;</p>
              <div className="flex items-center gap-4 pt-6 border-t border-border/50">
                <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-primary font-black text-xl shadow-lg shadow-secondary/10">
                  {testimonial.avatar}
                </div>
                <div className="flex-1">
                  <div className="font-black text-secondary uppercase text-sm tracking-widest">{testimonial.name}</div>
                  <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-1">{testimonial.role}</div>
                  <div className="text-xs text-secondary font-black uppercase tracking-widest mt-2">{testimonial.company}</div>
                </div>
              </div>
              <div className="mt-8 px-4 py-2 rounded-full bg-primary/20 text-secondary text-xs font-black uppercase tracking-widest inline-block border border-primary/30">
                {testimonial.metric}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
