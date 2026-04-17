"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does the AI skill gap analysis work?",
    answer: "Our AI analyzes your resume, LinkedIn profile, and career goals against thousands of job listings in your target field. It identifies specific skills, certifications, and experiences that employers are looking for but that you may be missing, then creates a prioritized learning roadmap.",
  },
  {
    question: "Will the auto-apply feature apply to jobs I don't want?",
    answer: "No. You set your preferences including job title, salary range, location, company size, and more. Our AI only applies to positions that match at least 85% of your criteria. You can review and adjust applications before they're sent.",
  },
  {
    question: "How are the personalized courses created?",
    answer: "Based on your skill gap analysis, our AI curates and generates bite-sized courses from trusted educational content. Each course is designed to fill a specific gap and typically takes 2-4 hours to complete, with practical projects to build your portfolio.",
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use enterprise-grade encryption for all data at rest and in transit. We never share your personal information with employers without your explicit consent. You can delete all your data at any time.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time with no penalties. If you cancel, you'll retain access until the end of your billing period. We also offer a 7-day free trial on Pro plans with no credit card required.",
  },
  {
    question: "What makes Vex different from other job search tools?",
    answer: "Vex is the only platform that combines skill gap analysis, personalized learning, CV optimization, and automated job applications in one integrated workflow. Instead of using 5 different tools, Vex handles your entire career advancement journey.",
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 30-day money-back guarantee on all paid plans. If you're not satisfied with Vex, contact our support team within 30 days of your purchase for a full refund.",
  },
];

export function FAQ() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section id="faq" className="py-24 relative">
      <div className="max-w-[800px] mx-auto px-6" ref={containerRef}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-4 block">
            FAQ
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6" style={{ letterSpacing: "-0.02em" }}>
            Frequently Asked
            <br />
            <span className="text-primary">Questions</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about Vex.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-2xl px-6 data-[state=open]:border-primary/50 transition-colors"
              >
                <AccordionTrigger className="text-left text-foreground font-semibold hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
