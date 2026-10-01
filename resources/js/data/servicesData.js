/**
 * @file servicesData.js
 * @description Data for Blood Service, Health Services, Training Courses, and Donation accounts.
 */

export const BLOOD_SERVICE_INFO = {
    overview:
        'The National Blood Service of the Philippine Red Cross is the major provider of safe, quality, and affordable blood products in the country, operating 24/7 with stringent screening standards.',
    eligibility: [
        'Must be in good health condition and well-rested.',
        'Age between 16 and 65 years old (16-17 requires parental consent).',
        'Weigh at least 110 lbs (50 kg).',
        'Hemoglobin level of at least 125 g/L.',
        'Blood pressure between 90-140 systolic and 60-90 diastolic.',
        'No alcohol intake within 24 hours prior to donation.',
        'No recent tattoo or body piercing within the past 12 months.',
    ],
    donationSteps: [
        {
            step: 1,
            title: 'Registration & Donor Form',
            desc: 'Fill out the confidential donor health history questionnaire and provide a valid government-issued ID.',
        },
        {
            step: 2,
            title: 'Health Screening & Vitals',
            desc: 'Trained medical staff check your blood pressure, temperature, weight, and perform a quick finger-prick hemoglobin test.',
        },
        {
            step: 3,
            title: 'Physician Consultation',
            desc: 'A medical officer reviews your medical history in a private setting to ensure both donor and recipient safety.',
        },
        {
            step: 4,
            title: 'Blood Collection',
            desc: 'A certified phlebotomist collects one unit (approx. 450ml) of blood in 8–10 minutes using sterile, single-use equipment.',
        },
        {
            step: 5,
            title: 'Rest & Refreshment',
            desc: 'Relax in our recovery lounge for 10–15 minutes and enjoy light snacks and drinks to help your body replenish fluids.',
        },
    ],
    bloodTypes: [
        { type: 'O+', canDonateTo: 'O+, A+, B+, AB+', canReceiveFrom: 'O+, O-' },
        { type: 'O-', canDonateTo: 'All Blood Types (Universal)', canReceiveFrom: 'O-' },
        { type: 'A+', canDonateTo: 'A+, AB+', canReceiveFrom: 'A+, A-, O+, O-' },
        { type: 'A-', canDonateTo: 'A+, A-, AB+, AB-', canReceiveFrom: 'A-, O-' },
        { type: 'B+', canDonateTo: 'B+, AB+', canReceiveFrom: 'B+, B-, O+, O-' },
        { type: 'B-', canDonateTo: 'B+, B-, AB+, AB-', canReceiveFrom: 'B-, O-' },
        { type: 'AB+', canDonateTo: 'AB+ only', canReceiveFrom: 'All Types (Universal)' },
        { type: 'AB-', canDonateTo: 'AB+, AB-', canReceiveFrom: 'AB-, A-, B-, O-' },
    ],
};

export const HEALTH_SERVICES_PROGRAMS = [
    {
        title: 'Community Health & Nursing Care',
        desc: 'Delivers preventive and primary health care consultations, maternal and child care, and basic nursing services directly to barangays across Muntinlupa.',
        iconName: 'HeartPulse',
    },
    {
        title: 'Emergency Medical Services (EMS)',
        desc: 'Operates 24/7 emergency ambulance dispatch staffed with certified emergency medical technicians (EMTs) for patient stabilization and rapid transport.',
        iconName: 'Ambulance',
    },
    {
        title: 'WASH (Water, Sanitation & Hygiene)',
        desc: 'Provides water purification tankers, emergency water distribution, and community sanitation hygiene campaigns during disease outbreaks and disasters.',
        iconName: 'Droplet',
    },
    {
        title: 'Epidemic & Outbreak Response',
        desc: 'Rapid deployment of vaccination teams, disease surveillance, fever clinics, and community health education during dengue, measles, or pandemic outbreaks.',
        iconName: 'ShieldAlert',
    },
];

export const TRAINING_COURSES = [
    {
        id: 'cpr-aed',
        title: 'Basic First Aid & CPR / AED Training',
        duration: '16 Hours (2 Days)',
        audience: 'General Public, Workplace Responders, Students, Security Staff',
        description: 'Comprehensive hands-on course teaching emergency first aid, automated external defibrillator (AED) usage, adult/child/infant CPR, and bandaging techniques.',
        certification: 'PRC Valid Certificate (Valid for 2 Years)',
    },
    {
        id: 'bls',
        title: 'Basic Life Support for Healthcare Providers (BLS)',
        duration: '8 Hours (1 Day)',
        audience: 'Nurses, Doctors, EMTs, Allied Health Professionals',
        description: 'Advanced life support training covering high-quality CPR, multi-rescuer coordination, bag-mask ventilation, and cardiac arrest management.',
        certification: 'PRC Healthcare Provider BLS Card',
    },
    {
        id: 'water-safety',
        title: 'Water Safety & Lifesaving Certification',
        duration: '24 Hours (3 Days)',
        audience: 'Swimmers, Lifeguards, Resort and Pool Personnel',
        description: 'Techniques for aquatic rescue, safe entries, spinal injury management in water, and water survival under emergency conditions.',
        certification: 'PRC Lifesaving Certification (Valid for 2 Years)',
    },
    {
        id: 'disaster-prep',
        title: 'Community Disaster Preparedness (143)',
        duration: '8 Hours (1 Day)',
        audience: 'Barangay Leaders, Youth Groups, Homeowners Associations',
        description: 'Community-based disaster risk reduction, family disaster planning, hazard identification, and early warning communication protocols.',
        certification: 'Red Cross 143 Volunteer Certificate',
    },
];

export const BANK_ACCOUNTS = [
    {
        bank: 'Banco de Oro (BDO)',
        accountName: 'Philippine Red Cross - Rizal Chapter Muntinlupa',
        accountNumber: '00-045-800-4591',
        branch: 'Muntinlupa City Branch',
    },
    {
        bank: 'Bank of the Philippine Islands (BPI)',
        accountName: 'Philippine Red Cross Muntinlupa',
        accountNumber: '0181-0428-22',
        branch: 'Alabang Town Center Branch',
    },
    {
        bank: 'Metrobank',
        accountName: 'Philippine Red Cross - Muntinlupa City',
        accountNumber: '175-3-17551234-8',
        branch: 'Putatan Muntinlupa Branch',
    },
];

export const DONATION_POLICIES = [
    {
        title: 'Cash Donations',
        desc: 'Direct bank deposits, online transfers, and on-site payments are issued an official Philippine Red Cross donation receipt (BIR tax-deductible).',
    },
    {
        title: 'In-Kind Relief Goods',
        desc: 'We accept sealed non-perishable food items (at least 6 months before expiry), potable bottled water, brand new hygiene supplies, and first aid materials.',
    },
    {
        title: 'No Used Clothing Policy',
        desc: 'Pursuant to Republic Act No. 4653, PRC strictly maintains a "No Used Clothing" policy to safeguard recipient communities against hygiene and health hazards.',
    },
];
