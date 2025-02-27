'use client'

import { useId } from 'react'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import clsx from 'clsx'

import { Container } from '@/components/Container'

interface Feature {
  name: React.ReactNode
  summary: string
  description: string
}

const features: Array<Feature> = [
    {
      name: 'Workday Login & Account Issues',
      summary: 'Get help with logging in, account access, and password recovery.',
      description:
        "Frequently, questions arise about workday login issues, including usernames, passwords, and errors during sign-in. If you're encountering difficulties, we’ve got solutions ready to get you back on track.",
    },
    {
      name: 'Benefits & Claims',
      summary: 'Find answers about benefits, health care, and claims processing.',
      description:
        "Questions around benefits like extended health care, tax slips, and EI claims are common. If you’re looking to cancel benefits, change your information, or submit claims, we can walk you through the process.",
    },
    {
      name: 'Vacation, Time-Off, and Pay Issues',
      summary: 'Learn how to manage your vacation days, casual time off, and payee information.',
      description:
        "Whether it’s using vacation days ahead of time or adding hours for casual staff, common queries often center around time-off policies and payroll. We’ll help you navigate these processes, ensuring accuracy and ease.",
    },  
]

function Feature({
  feature,
  isActive,
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & {
  feature: Feature
  isActive: boolean
}) {
  return (
    <div
      className={clsx(className, !isActive && 'opacity-75 hover:opacity-100')}
      {...props}
    >
      <h3
        className={clsx(
          'mt-6 text-sm font-medium',
          isActive ? 'text-purple-900' : 'text-slate-600',
        )}
      >
        {feature.name}
      </h3>
      <p className="mt-2 font-display text-xl text-slate-900">
        {feature.summary}
      </p>
      <p className="mt-4 text-sm text-slate-600">{feature.description}</p>
    </div>
  )
}

function FeaturesMobile() {
  return (
    <div className="-mx-4 mt-20 flex flex-col gap-y-10 overflow-hidden px-4 sm:-mx-6 sm:px-6 lg:hidden">
      {features.map((feature) => (
        <div key={feature.summary}>
          <Feature feature={feature} className="mx-auto max-w-2xl" isActive />
        </div>
      ))}
    </div>
  )
}

function FeaturesDesktop() {
  return (
    <TabGroup className="hidden lg:mt-20 lg:block">
      {({ selectedIndex }) => (
        <>
          <TabList className="grid grid-cols-3 gap-x-8">
            {features.map((feature, featureIndex) => (
              <Feature
                key={feature.summary}
                feature={{
                  ...feature,
                  name: (
                    <Tab className="data-selected:not-data-focus:outline-hidden">
                      <span className="absolute inset-0" />
                      {feature.name}
                    </Tab>
                  ),
                }}
                isActive={featureIndex === selectedIndex}
                className="relative"
              />
            ))}
          </TabList>
        </>
      )}
    </TabGroup>
  )
}

export function SecondaryFeatures() {
  return (
    <section
      id="commonquestions"
      aria-label="Common Questions asked to the HR team"
      className="pt-20 pb-14 sm:pt-32 sm:pb-20 lg:pb-32"
    >
      <Container>
        <div className="mx-auto max-w-2xl md:text-center">
        <h2 className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">
          Common Questions
        </h2>
        <p className="mt-4 text-lg tracking-tight text-slate-700">
          Here are some of the most common questions our HR team receives, aimed at helping you navigate workplace policies and practices with ease.
        </p>
        </div>
        <FeaturesMobile />
        <FeaturesDesktop />
      </Container>
    </section>
  )
}
