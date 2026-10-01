/**
 * @file aboutData.js
 * @description Data for About, Mission/Vision, and Chapter Overview pages.
 */

export const CHAPTER_STATS = [
    { num: '9', label: 'Barangays served in Muntinlupa' },
    { num: '500+', label: 'Active registered volunteers' },
    { num: '24 / 7', label: 'Emergency response operations' },
];

export const CORE_VALUES = [
    {
        title: 'Commitment to Humanity',
        desc: 'We are driven by compassion and the urgent desire to prevent and alleviate human suffering wherever it may be found.',
        iconName: 'Heart',
    },
    {
        title: 'Volunteer Service',
        desc: 'Our strength lies in the dedication of volunteers who selflessly give their time, skills, and energy to help those in need.',
        iconName: 'Users',
    },
    {
        title: 'Integrity & Transparency',
        desc: 'We uphold the highest ethical standards, accountability, and stewardship in all our humanitarian actions and resources.',
        iconName: 'Shield',
    },
    {
        title: 'Emergency Preparedness',
        desc: 'We empower communities with life-saving skills, early warning awareness, and robust disaster response systems.',
        iconName: 'Activity',
    },
];

export const MISSION_STATEMENT =
    'The Philippine Red Cross will remain the premier humanitarian organization in the Philippines, committed to providing quality life-saving services that protect the life and dignity especially of indigent Filipinos in vulnerable situations.';

export const VISION_STATEMENT =
    'To be the foremost humanitarian organization in the country, capable of delivering timely, effective, and compassionate services to the most vulnerable in times of disaster, emergency, and health crises.';

export const OUTREACH_STORIES = [
    {
        id: 'outreach',
        title: 'Community Outreach',
        location: 'Muntinlupa City',
        desc: 'Red Cross volunteers conduct community outreach activities across Muntinlupa, providing assistance, guidance, and direct support to residents, especially families and children in need.',
        fullDesc: 'Our Community Outreach program reaches the most vulnerable sectors of Muntinlupa City. Volunteers regularly visit barangays to provide basic health consultations, distribute relief goods, and conduct community education sessions. This program has touched thousands of lives across the 9 barangays we serve, ensuring that no family is left behind during times of need.',
        tagLabel: 'Outreach',
        image: '/images/outreach.jpg',
    },
    {
        id: 'relief',
        title: 'Relief Distribution',
        location: 'Cupang, Muntinlupa',
        desc: 'Volunteers distribute relief goods during coordinated humanitarian operations in Muntinlupa, ensuring timely aid and strengthening community resilience.',
        fullDesc: 'During disasters and calamities, our Relief Distribution team mobilizes rapidly to deliver food packs, potable water, hygiene kits, and other essential supplies to affected families. Our logistics network ensures that aid reaches even the most hard-to-reach areas of Muntinlupa within hours of a disaster declaration. We coordinate closely with local government units for maximum efficiency.',
        tagLabel: 'Relief',
        image: '/images/relief.jpg',
    },
    {
        id: 'assistance',
        title: 'Community Assistance',
        location: 'Bayanan Community, Muntinlupa',
        desc: 'Red Cross volunteers visit neighborhoods in Muntinlupa to deliver essential aid, health kits, and check on vulnerable residents.',
        fullDesc: 'Our Community Assistance program provides ongoing support to marginalized communities in Muntinlupa. Volunteers conduct regular welfare checks, provide psychosocial support, and connect residents with government services and other humanitarian organizations. Special attention is given to elderly residents, persons with disabilities, and families affected by poverty or displacement.',
        tagLabel: 'Assistance',
        image: '/images/assistance.jpg',
    },
];
