import { RESUME_TRAINING_DATASET } from "./career-dataset";

export class CareerDataService {
  /**
   * Identifies the closest industry standard category based on a role title or description.
   */
  static getIndustryByRoleOrDescription(roleName: string, description = ""): string {
    const roleLower = roleName.toLowerCase();
    const descLower = description.toLowerCase();

    // Mapping key terms to dataset categories
    const mappings: Record<string, string[]> = {
      Software_Engineering: ["developer", "software", "frontend", "backend", "fullstack", "web", "programmer", "react", "node"],
      AI_ML: ["machine learning", "ml", "ai", "deep learning", "nlp", "data scientist", "pytorch", "tensorflow", "neural"],
      Cybersecurity: ["cyber", "security", "threat", "hunting", "incident", "pentest", "vulnerability", "firewall", "siem"],
      Finance_Investment_Banking: ["finance", "banking", "investment", "m&a", "valuation", "analyst", "dcf", "lbo", "equity"],
      Accounting: ["accounting", "accountant", "audit", "general ledger", "gaap", "reconciliation", "tax", "quickbooks"],
      Healthcare_Nursing: ["nurse", "nursing", "icu", "healthcare", "clinical", "hospital", "patient", "medical", "acls"],
      Law: ["law", "lawyer", "attorney", "legal", "corporate counsel", "contracts", "bar", "litigation"],
      Education_Teaching: ["teacher", "teaching", "education", "school", "classroom", "curriculum", "educator", "iep", "stem"],
      Marketing_Sales: ["marketing", "sales", "seo", "sem", "crm", "campaign", "brand", "salesforce", "hubspot"],
      Logistics_Supply_Chain: ["logistics", "supply chain", "warehouse", "wms", "inventory", "procurement", "shipping"],
      Architecture_Engineering: ["architecture", "architectural", "bim", "revit", "autocad", "leed", "civil engineer"],
      Hospitality_Retail_CustomerSupport: ["customer service", "hospitality", "retail", "guest", "pos", "conflict resolution"],
      HR_Administration: ["hr", "human resources", "generalist", "recruitment", "payroll", "employee relations", "hris"],
      Aviation: ["pilot", "aviation", "flight", "faa", "aircraft", "copilot"],
      Executive_Roles: ["coo", "ceo", "cfo", "cto", "executive", "vp", "chief", "president", "director"],
      Internships_Students: ["intern", "internship", "student", "graduate", "university", "apprentice"],
      Freelancing_RemoteWork: ["freelance", "remote", "independent contractor", "distributed", "contractor"]
    };

    for (const [category, keywords] of Object.entries(mappings)) {
      for (const kw of keywords) {
        if (roleLower.includes(kw) || descLower.includes(kw)) {
          return category;
        }
      }
    }

    // Default to general software engineering if no match is found
    return "Software_Engineering";
  }

  /**
   * Retrieves industry standards for a designated industry.
   */
  static getIndustryStandards(industryKey: string) {
    const industries = RESUME_TRAINING_DATASET.industries as any;
    return industries[industryKey]?.industry_standards || industries["Software_Engineering"].industry_standards;
  }

  /**
   * Retrieves high-quality role examples for few-shot AI training.
   */
  static getIndustryExamples(industryKey: string) {
    const industries = RESUME_TRAINING_DATASET.industries as any;
    return industries[industryKey]?.role_examples || industries["Software_Engineering"].role_examples;
  }
}
