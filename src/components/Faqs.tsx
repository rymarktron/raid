import Image from "next/image";

import { Container } from "@/components/Container";
import backgroundImage from "@/images/background-faqs.jpg";

const faqs = [
  [
    {
      question: "How reliable is this chatbot?",
      answer:
        "The chatbot is designed to provide quick and accurate responses based on the information it has. While it’s highly reliable for general inquiries, some questions may require human assistance. If the chatbot can’t answer your question, it will direct you to the appropriate department.",
    },
    {
      question: "Does this chatbot store my personal information?",
      answer:
        "The chatbot does not store sensitive personal information like your social security number or bank account details. However, it may retain interaction history to improve future responses and provide better support. All data is handled according to our privacy policy.",
    },
    {
      question: "How does the chatbot work?",
      answer:
        "The chatbot uses a set of pre-programmed responses to common questions. It is designed to understand and respond to a wide range of HR-related queries, providing you with immediate answers. For more complex issues, it will direct you to a human representative.",
    },
  ],
  [
    {
      question: "Can I trust the answers provided by the chatbot?",
      answer:
        "The chatbot pulls answers from official university resources and is designed to be accurate. However, for important or complex matters, it’s always a good idea to double-check with HR or other university departments.",
    },
    {
      question: "What kind of information can the chatbot help with?",
      answer:
        "The chatbot can assist with HR-related questions, including policies, benefits, payroll, time off, and general university procedures. For anything beyond that, the chatbot will refer you to the appropriate resource.",
    },
    {
      question: "Does the chatbot work 24/7?",
      answer:
        "Yes! The chatbot is available at all hours to assist with general inquiries. However, for urgent or specific requests, it may refer you to HR during regular business hours.",
    },
  ],
  [
    {
      question: "Can I ask the chatbot for personalized advice?",
      answer:
        "The chatbot provides general information and cannot offer personalized advice. For tailored advice, please contact HR directly.",
    },
    {
      question: "How do I know if the chatbot understands my question?",
      answer:
        "The chatbot is designed to recognize and respond to a wide range of questions. If it doesn’t understand your question, it will either ask for clarification or direct you to HR for assistance.",
    },
    {
      question:
        "What happens if the chatbot doesn’t have the answer to my question?",
      answer:
        "If the chatbot can’t provide an answer, it will either refer you to the appropriate department or provide contact information for human support.",
    },
  ],
  [
    {
      question: "Will the questions be stored in the chatbot?",
      answer:
        "Yes, your conversation with the chatbot is stored for training purposes. The chatbot is designed to handle your inquiries securely in accordance with our privacy policies. However, please avoid sharing sensitive personal information during your chat.",
    },
  ],
];

const general_faqs = [
  {
    question: "Where can I find information about my employee benefits?",
    answer:
      'You can find all the details about your benefits on the HR portal under the "Employee Benefits" section. If you need further assistance, feel free to contact the HR team directly.',
  },
  {
    question: "How do I update my personal information with HR?",
    answer:
      'To update your personal information, simply log in to the HR portal and go to the "Profile" section. If you need help, the HR team is always available via email.',
  },
  {
    question: "Where can I access my pay stubs?",
    answer:
      "Pay stubs are available on the HR portal under Payroll. You can download and view them anytime. If you're having trouble accessing them, contact the payroll department.",
  },
  {
    question: "How do I request time off?",
    answer:
      'You can request time off through the university’s employee management system. Go to the "Time Off" section and submit your request. HR will review and confirm.',
  },
  {
    question: "I need to apply for family leave. What’s the process?",
    answer:
      'For family leave, please visit the "Leave of Absence" section on the HR portal to download the application form. If you need assistance, you can also reach out to the HR team.',
  },
  {
    question: "I’ve lost my university ID, what should I do?",
    answer:
      "Please contact the HR team directly via email or visit the HR office. They will help you with a replacement ID and guide you through the process.",
  },
  {
    question: "If the chatbot can’t answer my question, where should I go?",
    answer:
      "If the chatbot can’t provide the answer, please reach out to the HR team via email or visit the HR office. They are always happy to assist you with more complex inquiries.",
  },
  {
    question: "How can I access the university’s wellness programs?",
    answer:
      'You can find information about wellness programs in the "Employee Wellness" section on the HR portal. Additionally, feel free to contact HR for specific details on available resources.',
  },
  {
    question: "What are the university’s policies on remote work?",
    answer:
      "The remote work policy is outlined in the HR handbook, which can be accessed through the HR portal. If you need clarification, HR is available to answer any questions you may have.",
  },
  {
    question: "How do I submit a request for professional development funding?",
    answer:
      'Professional development funding requests are submitted through the "Professional Development" section on the HR portal. Complete the form and HR will review your submission.',
  },
];

export function Faqs() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="relative overflow-hidden bg-slate-50 py-20 sm:py-32"
    >
      <Container className="relative">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2
            id="faq-title"
            className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl"
          >
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg tracking-tight text-slate-700">
            If you can’t find what you’re looking for, email our support team
            and if you’re lucky someone will get back to you.
          </p>
        </div>
        <ul className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
          {faqs.map((column, columnIndex) => (
            <li key={columnIndex}>
              <ul className="flex flex-col gap-y-8">
                {column.map((faq, faqIndex) => (
                  <li key={faqIndex}>
                    <h3 className="font-display text-lg/7 text-slate-900">
                      {faq.question}
                    </h3>
                    <p className="mt-4 text-sm text-slate-700">{faq.answer}</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
