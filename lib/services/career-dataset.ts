export const RESUME_TRAINING_DATASET = {
  "metadata": {
    "version": "1.0",
    "last_updated": "2026-05-12",
    "total_categories": 17,
    "description": "Comprehensive structured dataset of high-quality CV/resume patterns for AI training."
  },
  "industries": {
    "Software_Engineering": {
      "role_examples": [
        {
          "role": "Full Stack Developer",
          "experience_level": "Mid-level",
          "summary": "Experienced Full Stack Developer with a focus on scalable cloud architectures and high-performance APIs.",
          "key_skills": ["React", "Node.js", "AWS", "Docker", "Kubernetes", "PostgreSQL"],
          "measurable_achievements": [
            "Reduced API latency by 40% through strategic caching and database optimization.",
            "Led a team of 5 to migrate legacy monolithic architecture to microservices, improving deployment frequency by 3x."
          ],
          "structure": ["Header", "Technical Skills", "Professional Experience", "Projects", "Education"],
          "formatting_style": "Modern, clean, single-column",
          "ats_score_factors": ["Keyword density for AWS/Cloud", "Action verbs like 'Led', 'Migrated'", "Clear section headers"]
        }
      ],
      "industry_standards": {
        "section_order": ["Header", "Technical Skills", "Experience", "Projects", "Education"],
        "preferred_wording": ["Scaled", "Optimized", "Architected", "Deployed", "Refactored"],
        "common_certifications": ["AWS Certified Solutions Architect", "Google Professional Cloud Architect"],
        "typography": "Sans-serif (Arial, Helvetica)",
        "country_specific_notes": { "US": "1 page preferred", "Europe": "Photo often included" }
      }
    },
    "AI_ML": {
      "role_examples": [
        {
          "role": "Machine Learning Engineer",
          "experience_level": "Mid-level",
          "summary": "Specialist in deep learning and NLP with experience in deploying production-grade models.",
          "key_skills": ["PyTorch", "TensorFlow", "NLP", "Scikit-learn", "Pandas", "MLOps"],
          "measurable_achievements": [
            "Improved model accuracy by 15% for a sentiment analysis task using transformer-based architectures.",
            "Optimized inference time by 50% using model quantization and pruning techniques."
          ],
          "structure": ["Header", "Research Interests", "Education", "Technical Skills", "Experience", "Publications"],
          "formatting_style": "Academic-hybrid, detail-oriented",
          "ats_score_factors": ["Specific model names", "Framework proficiency", "Publication citations"]
        }
      ],
      "industry_standards": {
        "section_order": ["Header", "Education", "Technical Skills", "Experience", "Projects", "Publications"],
        "preferred_wording": ["Trained", "Validated", "Fine-tuned", "Implemented", "Analyzed"],
        "common_certifications": ["Google Professional ML Engineer", "TensorFlow Developer Certificate"],
        "typography": "Clean (Inter, Roboto)",
        "country_specific_notes": { "US": "Emphasis on projects/GitHub" }
      }
    },
    "Cybersecurity": {
      "role_examples": [
        {
          "role": "Security Analyst",
          "experience_level": "Mid-level",
          "summary": "Proactive security professional with expertise in threat hunting and incident response.",
          "key_skills": ["SIEM", "Penetration Testing", "NIST", "Firewalls", "Incident Response"],
          "measurable_achievements": [
            "Identified and mitigated 50+ critical vulnerabilities through regular penetration testing.",
            "Developed an automated incident response playbook, reducing MTTR by 30."
          ],
          "structure": ["Header", "Certifications", "Technical Skills", "Professional Experience", "Education"],
          "formatting_style": "Structured, technical",
          "ats_score_factors": ["Certification acronyms (CISSP, CEH)", "Compliance framework names", "Tool proficiency"]
        }
      ],
      "industry_standards": {
        "section_order": ["Header", "Certifications", "Technical Skills", "Experience", "Education"],
        "preferred_wording": ["Hardened", "Mitigated", "Audited", "Detected", "Responded"],
        "common_certifications": ["CISSP", "CEH", "CompTIA Security+"],
        "typography": "Standard (Arial, Calibri)",
        "country_specific_notes": { "Global": "Clearance levels are often required" }
      }
    },
    "Finance_Investment_Banking": {
      "role_examples": [
        {
          "role": "Investment Banking Analyst",
          "experience_level": "Entry-level",
          "summary": "High-achieving finance graduate with experience in M&A valuation and financial modeling.",
          "key_skills": ["Financial Modeling", "Valuation", "DCF", "LBO", "Excel", "Bloomberg"],
          "measurable_achievements": [
            "Assisted in the valuation of a $500M cross-border M&A transaction using DCF and comparable company analysis.",
            "Prepared comprehensive pitch books and management presentations for senior leadership."
          ],
          "structure": ["Header", "Education", "Work & Leadership Experience", "Skills, Activities & Interests"],
          "formatting_style": "Traditional, conservative, 1-page strict",
          "ats_score_factors": ["GPA/SAT scores", "Keywords like 'Valuation', 'M&A'", "Prestigious university names"]
        }
      ],
      "industry_standards": {
        "section_order": ["Header", "Education", "Work & Leadership Experience", "Skills, Activities & Interests"],
        "preferred_wording": ["Analyzed", "Valued", "Modeled", "Executed", "Structured"],
        "common_certifications": ["CFA Level 1", "FINRA Series 79/63"],
        "typography": "Serif (Times New Roman, Garamond)",
        "country_specific_notes": { "Australia": "2-3 pages common", "US": "No photo" }
      }
    },
    "Accounting": {
      "role_examples": [
        {
          "role": "Staff Accountant",
          "experience_level": "Entry-level",
          "summary": "Detail-oriented accountant with a strong foundation in GAAP and financial reporting.",
          "key_skills": ["GAAP", "Audit", "General Ledger", "Reconciliation", "QuickBooks"],
          "measurable_achievements": [
            "Managed the month-end closing process for 10+ clients, ensuring 100% accuracy and compliance.",
            "Identified $50K in tax savings through comprehensive audit and reconciliation."
          ],
          "structure": ["Header", "Professional Summary", "Certifications", "Professional Experience", "Technical Skills", "Education"],
          "formatting_style": "Clean, structured",
          "ats_score_factors": ["CPA status", "Standard names (GAAP, IFRS)", "Software proficiency"]
        }
      ],
      "industry_standards": {
        "section_order": ["Header", "Certifications", "Experience", "Skills", "Education"],
        "preferred_wording": ["Audited", "Reconciled", "Reported", "Compiled", "Analyzed"],
        "common_certifications": ["CPA", "CMA", "ACCA"],
        "typography": "Standard (Calibri, Arial)",
        "country_specific_notes": { "US": "CPA is the gold standard" }
      }
    },
    "Healthcare_Nursing": {
      "role_examples": [
        {
          "role": "Registered Nurse (ICU)",
          "experience_level": "Mid-level",
          "summary": "Compassionate ICU Nurse with 5+ years of experience in critical care and patient advocacy.",
          "key_skills": ["Critical Care", "Patient Assessment", "ACLS", "BLS", "Epic EHR", "IV Therapy"],
          "measurable_achievements": [
            "Maintained 100% compliance with patient safety protocols in a high-pressure ICU environment.",
            "Reduced medication errors by 15% through the implementation of a new double-check system."
          ],
          "structure": ["Header", "Certifications/Licenses", "Professional Summary", "Clinical Skills", "Experience", "Education"],
          "formatting_style": "Clean, functional, emphasis on certifications",
          "ats_score_factors": ["Certification acronyms (RN, ACLS)", "EHR system names", "Clinical competency keywords"]
        }
      ],
      "industry_standards": {
        "section_order": ["Header", "Certifications/Licenses", "Professional Summary", "Clinical Skills", "Experience", "Education"],
        "preferred_wording": ["Administered", "Monitored", "Coordinated", "Advocated", "Assessed"],
        "common_certifications": ["RN", "BLS", "ACLS", "CCRN"],
        "typography": "Standard (Calibri, Arial)",
        "country_specific_notes": { "Global": "License numbers must be verifiable" }
      }
    },
    "Law": {
      "role_examples": [
        {
          "role": "Corporate Attorney",
          "experience_level": "Mid-level",
          "summary": "Detail-oriented attorney specializing in corporate governance, M&A, and contract negotiation.",
          "key_skills": ["Legal Research", "Contract Drafting", "M&A", "Regulatory Compliance", "Westlaw"],
          "measurable_achievements": [
            "Negotiated and closed over 20 commercial contracts valued at $10M+ each.",
            "Conducted comprehensive due diligence for a $200M acquisition, identifying key risk factors."
          ],
          "structure": ["Bar Admission", "Education", "Experience", "Activities/Honors", "Interests"],
          "formatting_style": "Traditional, formal",
          "ats_score_factors": ["Bar admission status", "Keywords like 'Litigation', 'Compliance'", "Law review participation"]
        }
      ],
      "industry_standards": {
        "section_order": ["Bar Admission", "Education", "Experience", "Activities/Honors", "Interests"],
        "preferred_wording": ["Litigated", "Drafted", "Negotiated", "Advised", "Researched"],
        "common_certifications": ["State Bar Admission", "CIPP/US"],
        "typography": "Serif (Century Schoolbook, Garamond)",
        "country_specific_notes": { "US": "Focus on JD and Bar", "UK": "Focus on LPC/SQE" }
      }
    },
    "Education_Teaching": {
      "role_examples": [
        {
          "role": "Secondary School Teacher",
          "experience_level": "Mid-level",
          "summary": "Dedicated educator with a track record of improving student engagement and academic performance.",
          "key_skills": ["Classroom Management", "Curriculum Development", "Differentiated Instruction", "IEP"],
          "measurable_achievements": [
            "Improved student standardized test scores by 20% through personalized learning plans.",
            "Developed a new STEM curriculum adopted by the entire school district."
          ],
          "structure": ["Header", "Certifications/Licenses", "Education", "Teaching Experience", "Skills"],
          "formatting_style": "Warm, professional, readable",
          "ats_score_factors": ["Teaching license details", "Subject matter keywords", "Student outcome metrics"]
        }
      ],
      "industry_standards": {
        "section_order": ["Header", "Certifications/Licenses", "Education", "Teaching Experience", "Skills"],
        "preferred_wording": ["Instructed", "Developed", "Mentored", "Assessed", "Collaborated"],
        "common_certifications": ["State Teaching License", "National Board Certification"],
        "typography": "Clear (Verdana, Calibri)",
        "country_specific_notes": { "Global": "Clear background check often required" }
      }
    },
    "Marketing_Sales": {
      "role_examples": [
        {
          "role": "Marketing Manager",
          "experience_level": "Mid-level",
          "summary": "Results-driven marketer with expertise in digital strategy and brand growth.",
          "key_skills": ["SEO/SEM", "Content Strategy", "CRM", "Salesforce", "Market Research"],
          "measurable_achievements": [
            "Increased organic traffic by 50% through a comprehensive SEO audit and content overhaul.",
            "Managed a $1M annual marketing budget, achieving a 4x ROI on paid search campaigns."
          ],
          "structure": ["Header", "Professional Summary", "Core Competencies", "Experience", "Education"],
          "formatting_style": "Creative yet professional, portfolio link",
          "ats_score_factors": ["ROI figures", "Platform names (Salesforce, HubSpot)", "Campaign performance metrics"]
        }
      ],
      "industry_standards": {
        "section_order": ["Header", "Professional Summary", "Core Competencies", "Experience", "Education"],
        "preferred_wording": ["Grew", "Launched", "Generated", "Optimized", "Targeted"],
        "common_certifications": ["Google Ads Certification", "HubSpot Content Marketing"],
        "typography": "Modern (Open Sans, Lato)",
        "country_specific_notes": { "US": "Emphasis on digital metrics" }
      }
    },
    "Logistics_Supply_Chain": {
      "role_examples": [
        {
          "role": "Logistics Coordinator",
          "experience_level": "Mid-level",
          "summary": "Efficiency-focused professional with experience in warehouse management and supply chain optimization.",
          "key_skills": ["WMS", "TMS", "Inventory Control", "Vendor Management", "Procurement"],
          "measurable_achievements": [
            "Reduced shipping costs by 15% through vendor renegotiation and route optimization.",
            "Improved inventory accuracy from 85% to 98% using a new WMS implementation."
          ],
          "structure": ["Header", "Summary", "Experience", "Technical Skills", "Certifications"],
          "formatting_style": "Functional, detail-oriented",
          "ats_score_factors": ["WMS/TMS software names", "Efficiency percentages", "Compliance certifications"]
        }
      ],
      "industry_standards": {
        "section_order": ["Header", "Summary", "Experience", "Technical Skills", "Certifications"],
        "preferred_wording": ["Streamlined", "Negotiated", "Optimized", "Coordinated", "Sourced"],
        "common_certifications": ["CSCP", "CLTD", "OSHA 30"],
        "typography": "Standard (Arial, Calibri)",
        "country_specific_notes": { "US": "DOT/OSHA compliance is key" }
      }
    },
    "Architecture_Engineering": {
      "role_examples": [
        {
          "role": "Architectural Designer",
          "experience_level": "Mid-level",
          "summary": "Creative designer with proficiency in BIM and sustainable architecture.",
          "key_skills": ["AutoCAD", "Revit", "BIM", "SketchUp", "LEED"],
          "measurable_achievements": [
            "Designed and managed a $5M sustainable residential project from concept to completion.",
            "Reduced material waste by 10% through precise BIM modeling and structural analysis."
          ],
          "structure": ["Header", "Professional Summary", "Experience", "Project Highlights", "Technical Skills"],
          "formatting_style": "Visually balanced, portfolio link",
          "ats_score_factors": ["Software names (Revit, CAD)", "Licensure status (AIA, PE)", "Project budget figures"]
        }
      ],
      "industry_standards": {
        "section_order": ["Header", "Summary", "Experience", "Projects", "Skills", "Education"],
        "preferred_wording": ["Designed", "Drafted", "Modeled", "Supervised", "Specified"],
        "common_certifications": ["AIA", "PE", "LEED AP"],
        "typography": "Clean (Helvetica, Futura)",
        "country_specific_notes": { "Global": "Portfolio is as important as the resume" }
      }
    },
    "Hospitality_Retail_CustomerSupport": {
      "role_examples": [
        {
          "role": "Customer Service Lead",
          "experience_level": "Mid-level",
          "summary": "Empathetic leader with a focus on guest satisfaction and team performance.",
          "key_skills": ["Conflict Resolution", "POS Systems", "Guest Relations", "Team Leadership"],
          "measurable_achievements": [
            "Improved customer satisfaction scores by 30% through the implementation of a new feedback loop.",
            "Led a team of 15, consistently exceeding monthly sales targets by 10%."
          ],
          "structure": ["Header", "Summary", "Experience", "Skills", "Education"],
          "formatting_style": "Simple, readable",
          "ats_score_factors": ["Satisfaction metrics", "POS experience", "Soft skill keywords"]
        }
      ],
      "industry_standards": {
        "section_order": ["Header", "Summary", "Experience", "Skills", "Education"],
        "preferred_wording": ["Resolved", "Assisted", "Upsold", "Maintained", "Facilitated"],
        "common_certifications": ["ServSafe", "Customer Service Professional"],
        "typography": "Standard (Calibri, Verdana)",
        "country_specific_notes": { "US": "Focus on reliability and availability" }
      }
    },
    "HR_Administration": {
      "role_examples": [
        {
          "role": "HR Generalist",
          "experience_level": "Mid-level",
          "summary": "Versatile HR professional with expertise in recruitment, payroll, and employee relations.",
          "key_skills": ["HRIS", "Payroll", "Recruitment", "Compliance", "Performance Management"],
          "measurable_achievements": [
            "Reduced time-to-hire by 25% through the implementation of a new ATS.",
            "Achieved a 95% employee satisfaction rating through improved onboarding and engagement initiatives."
          ],
          "structure": ["Header", "Professional Summary", "Experience", "Education", "Certifications"],
          "formatting_style": "Professional, structured",
          "ats_score_factors": ["HRIS software names", "Recruitment metrics", "Compliance knowledge"]
        }
      ],
      "industry_standards": {
        "section_order": ["Header", "Summary", "Experience", "Skills", "Education"],
        "preferred_wording": ["Recruited", "Onboarded", "Administered", "Mediated", "Implemented"],
        "common_certifications": ["SHRM-CP", "PHR"],
        "typography": "Standard (Arial, Calibri)",
        "country_specific_notes": { "US": "Focus on SHRM/PHR" }
      }
    },
    "Aviation": {
      "role_examples": [
        {
          "role": "Commercial Pilot",
          "experience_level": "Mid-level",
          "summary": "Highly skilled pilot with 3,000+ flight hours and a clean safety record.",
          "key_skills": ["Flight Hours", "FAA Regulations", "CRM", "Navigation", "Emergency Procedures"],
          "measurable_achievements": [
            "Successfully completed 500+ commercial flights with 100% on-time performance.",
            "Maintained perfect compliance with FAA safety standards and crew resource management protocols."
          ],
          "structure": ["Header", "Flight Experience", "Certifications/Ratings", "Experience", "Education"],
          "formatting_style": "Highly technical, data-driven",
          "ats_score_factors": ["Flight hour totals", "Aircraft type ratings", "FAA/EASA certification"]
        }
      ],
      "industry_standards": {
        "section_order": ["Header", "Flight Hours", "Certifications", "Experience", "Education"],
        "preferred_wording": ["Operated", "Navigated", "Commanded", "Ensured", "Briefed"],
        "common_certifications": ["ATP", "First Class Medical", "Type Ratings"],
        "typography": "Clear (Arial, Roboto)",
        "country_specific_notes": { "Global": "Flight hours are the primary metric" }
      }
    },
    "Executive_Roles": {
      "role_examples": [
        {
          "role": "Chief Operating Officer (COO)",
          "experience_level": "Executive",
          "summary": "Visionary leader with 20+ years of experience in scaling global operations and driving revenue growth.",
          "key_skills": ["Strategic Planning", "P&L Management", "M&A", "Change Management", "Stakeholder Relations"],
          "measurable_achievements": [
            "Increased annual revenue from $50M to $250M over a 5-year period through strategic expansion.",
            "Led a global workforce of 1,000+ employees across 10 countries, improving retention by 25%."
          ],
          "structure": ["Header", "Executive Summary", "Strategic Experience", "Board Memberships", "Education"],
          "formatting_style": "High-impact, sophisticated, multi-page",
          "ats_score_factors": ["Revenue growth figures", "Global leadership keywords", "Board-level experience"]
        }
      ],
      "industry_standards": {
        "section_order": ["Header", "Executive Summary", "Strategic Experience", "Board Memberships", "Education"],
        "preferred_wording": ["Spearheaded", "Transformed", "Orchestrated", "Capitalized", "Championed"],
        "common_certifications": ["MBA", "Executive Leadership Certificate"],
        "typography": "Elegant (Georgia, Helvetica Neue)",
        "country_specific_notes": { "Global": "Focus on ROI and strategic impact" }
      }
    },
    "Internships_Students": {
      "role_examples": [
        {
          "role": "Software Engineering Intern",
          "experience_level": "Internship",
          "summary": "Motivated CS student with a strong foundation in algorithms and experience in personal projects.",
          "key_skills": ["Python", "Java", "Git", "Problem Solving", "Teamwork"],
          "measurable_achievements": [
            "Developed a web application using Flask and React as a personal project, gaining 100+ active users.",
            "Maintained a 3.9 GPA while participating in university coding competitions and hackathons."
          ],
          "structure": ["Header", "Education", "Projects", "Experience", "Skills"],
          "formatting_style": "Academic, clean, 1-page",
          "ats_score_factors": ["GPA (>3.5)", "Relevant coursework", "Project-based skills"]
        }
      ],
      "industry_standards": {
        "section_order": ["Header", "Education", "Projects", "Skills", "Experience"],
        "preferred_wording": ["Learned", "Built", "Collaborated", "Contributed", "Presented"],
        "common_certifications": ["Relevant University Degree (In-progress)"],
        "typography": "Standard (Calibri, Arial)",
        "country_specific_notes": { "US": "Focus on GPA and internships" }
      }
    },
    "Freelancing_RemoteWork": {
      "role_examples": [
        {
          "role": "Remote Project Manager",
          "experience_level": "Mid-level",
          "summary": "Independent professional with a track record of delivering complex projects for distributed teams.",
          "key_skills": ["Jira", "Slack", "Asana", "Remote Collaboration", "Self-Management"],
          "measurable_achievements": [
            "Managed 10+ remote projects simultaneously, delivering all within scope and budget.",
            "Implemented new digital communication protocols, increasing team productivity by 20%."
          ],
          "structure": ["Header", "Summary", "Skills", "Project History", "Experience"],
          "formatting_style": "Modern, digital-focused",
          "ats_score_factors": ["Remote tool proficiency", "Self-management keywords", "Client testimonials/outcomes"]
        }
      ],
      "industry_standards": {
        "section_order": ["Header", "Summary", "Skills", "Project History", "Experience"],
        "preferred_wording": ["Delivered", "Managed", "Facilitated", "Coordinated", "Executed"],
        "common_certifications": ["PMP", "Certified Scrum Master"],
        "typography": "Modern (Roboto, Open Sans)",
        "country_specific_notes": { "Global": "Reliability and digital communication are paramount" }
      }
    }
  }
};
