'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'

interface FAQItem {
  id: string
  question: string
  answer: string
}

export default function FAQ() {
  const t = useTranslations('faq')
  const locale = useLocale()

  const faqData: FAQItem[] = [
    {
      id: 'what-is-shopifree',
      question: t('whatIsShopifree.question'),
      answer: t('whatIsShopifree.answer')
    },
    {
      id: 'technical-knowledge',
      question: t('technicalKnowledge.question'),
      answer: t('technicalKnowledge.answer')
    },
    {
      id: 'custom-domain',
      question: t('customDomain.question'),
      answer: t('customDomain.answer')
    },
    {
      id: 'payment-methods',
      question: t('paymentMethods.question'),
      answer: t('paymentMethods.answer')
    },
    {
      id: 'whatsapp-sales',
      question: t('whatsappSales.question'),
      answer: t('whatsappSales.answer')
    },
    {
      id: 'costs-commissions',
      question: t('costsCommissions.question'),
      answer: t('costsCommissions.answer')
    }
  ]

  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id)
    } else {
      newOpenItems.add(id)
    }
    setOpenItems(newOpenItems)
  }

  return (
    <section className="bg-gray-50 py-20" aria-labelledby="faq-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Column - Title */}
          <div className="text-center lg:text-left">
            <h2 id="faq-heading" className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
              {t('title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-lg">
              {t('subtitle')}
            </p>
          </div>

          {/* Right Column - FAQ Accordion */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {faqData.map((item) => {
                const isOpen = openItems.has(item.id)
                
                return (
                  <div key={item.id} className="group">
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="w-full px-6 py-5 text-left focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-inset focus:ring-offset-0 hover:bg-gray-50 transition-colors duration-150 rounded-xl"
                      aria-expanded={isOpen}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-normal text-gray-900 pr-4">
                          {item.question}
                        </h3>
                        <div className="flex-shrink-0">
                          <div className={`w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center transition-all duration-200 ${isOpen ? 'bg-emerald-600' : 'group-hover:bg-emerald-200'}`}>
                            {isOpen ? (
                              <svg
                                className="w-4 h-4 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            ) : (
                              <svg
                                className={`w-4 h-4 transition-colors duration-200 ${isOpen ? 'text-white' : 'text-emerald-600 group-hover:text-emerald-700'}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                    
                    {/* Answer Content */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="px-6 pb-5">
                        <p className="text-gray-600 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}