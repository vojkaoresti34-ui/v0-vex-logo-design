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
    <section id="testimonials" className="py-24 relative">
      <div className="max-w-[1200px] mx-auto px-6" ref={containerRef}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-4 block">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6" style={{ letterSpacing: "-0.02em" }}>
            Loved by Thousands of
            <br />
            <span className="text-primary">Successful Job Seekers</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join over 10,000 professionals who landed their dream jobs with Vex.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-foreground mb-6 leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {testimonial.avatar}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  <div className="text-xs text-primary">{testimonial.company}</div>
                </div>
              </div>
              <div className="mt-4 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium inline-block">
                {testimonial.metric}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
