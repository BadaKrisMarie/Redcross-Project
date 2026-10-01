/**
 * @file public.js
 * @description Type definitions and data schemas for Philippine Red Cross public views.
 */

/**
 * @typedef {Object} StatMetric
 * @property {string} num - Numerical value or range (e.g. '9', '500+', '24/7')
 * @property {string} label - Descriptive metric label
 */

/**
 * @typedef {Object} PhotoStory
 * @property {string} title - Story or activity title
 * @property {string} location - Location within Muntinlupa
 * @property {string} desc - Short excerpt description
 * @property {string} fullDesc - Comprehensive narrative
 * @property {string} accent - Category color accent
 * @property {string} tagLabel - Tag label (e.g. 'Outreach', 'Relief')
 * @property {string} image - Image asset path or base64 URL
 */

/**
 * @typedef {Object} Milestone
 * @property {string} year - Year string (e.g. '1899', '1947')
 * @property {string} title - Milestone header
 * @property {string} desc - Historical description
 * @property {string} [photo] - Optional photo representation
 * @property {string} [caption] - Photo caption
 */

/**
 * @typedef {Object} Principle
 * @property {string} num - Roman numeral string (e.g. 'I', 'II')
 * @property {string} name - Principle name (e.g. 'HUMANITY')
 * @property {string} subtitle - Tagline or short translation
 * @property {string} desc - Comprehensive definition
 * @property {string} color - Theme color
 */

/**
 * @typedef {Object} TeamMember
 * @property {string} name - Full name
 * @property {string} title - Official title / designation
 * @property {string} [photo] - Photo URL / base64
 * @property {string[]} bio - Paragraphs of biography
 * @property {boolean} [isBoardList] - Flags whether this is a governor roster
 * @property {boolean} [isExecutiveTable] - Flags whether this is an executive table
 */

/**
 * @typedef {Object} FAQItem
 * @property {string} q - Question prompt
 * @property {string} a - Answer explanation
 */

/**
 * @typedef {Object} BankAccount
 * @property {string} bank - Name of the bank (e.g. 'BDO', 'BPI')
 * @property {string} accountName - Payee name
 * @property {string} accountNumber - Formatted account number
 * @property {string} [branch] - Bank branch
 * @property {string} [swift] - Swift code
 */

/**
 * @typedef {Object} TrainingCourse
 * @property {string} title - Course title
 * @property {string} duration - Duration string (e.g. '8 Hours / 1 Day')
 * @property {string} audience - Target participants
 * @property {string} description - Summary of course coverage
 * @property {string[]} topics - Key learning modules
 * @property {string} certification - Certification validity
 */

export {};
