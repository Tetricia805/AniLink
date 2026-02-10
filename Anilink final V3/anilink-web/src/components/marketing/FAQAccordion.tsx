import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "Is the AI diagnosis final?",
    answer: "No, the AI provides guidance and suggestions based on symptoms. Always consult a qualified veterinarian for a final diagnosis and treatment plan.",
  },
  {
    question: "Can I request a farm visit?",
    answer: "Yes! Many vets on our platform offer farm visits. You can filter vets by 'Farm Visits' availability and book directly through the app.",
  },
  {
    question: "How do I find a vet near me?",
    answer: "Use the 'Find a Vet' feature to search by location. The app shows vets sorted by distance, availability, and ratings. You can also use the map view for visual browsing.",
  },
  {
    question: "Do you sell real vet medicine?",
    answer: "Yes, our marketplace connects you with verified sellers offering genuine veterinary products, feeds, and supplies. All sellers are verified and products are quality-checked.",
  },
  {
    question: "How do records help me?",
    answer: "Health records help track your animals' medical history, vaccinations, treatments, and growth. This makes it easier to share information with vets and make informed decisions.",
  },
  {
    question: "Is this free?",
    answer: "Basic features like scanning, finding vets, and viewing records are free. Some premium features and marketplace purchases may have costs, but we keep pricing transparent.",
  },
];

export function FAQAccordion() {
  return (
    <Accordion type="single" collapsible className="w-full space-y-4">
      {faqs.map((faq, index) => (
        <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4">
          <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
