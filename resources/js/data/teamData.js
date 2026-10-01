/**
 * @file teamData.js
 * @description Leadership biographies, Board of Governors, and Executive Staff directory.
 */

export const LEADERSHIP_MEMBERS = {
    chairman: {
        key: 'chairman',
        name: 'Richard J. Gordon',
        title: 'Chairman and Chief Executive Officer',
        photo: '/images/chairman.jpg',
        bio: [
            'The Philippine Red Cross (PRC) Chairman and Chief Executive Officer Richard J. Gordon, concurrently a former member of the Philippine Senate, is well-known throughout his public service record for being an action man and for beating great odds in a disaster-prone country.',
            'In the 1980s as Mayor, he transformed Olongapo\'s "Sin City" image into a model city by engaging an active citizenry in solving crime, ensuring police accountability, improving garbage collection, health and sanitation and orderly public transport.',
            'In the 1990s he led the transformation of Subic Naval Base after the departure of the American Navy, inspiring 8,000 volunteers who preserved the US$8-billion facility and making it the Philippines\' premier free port and special economic zone.',
            'Consistently guiding him for more than 40 years of public service are the principles of the Red Cross and Red Crescent Movement. His humanitarian leadership has mobilized modern ambulances, rescue trucks, disaster response equipment, and state-of-the-art molecular laboratories across the Philippines.',
            'On many occasions, Gordon led rescue, relief and rehabilitation operations around the Philippines, including major typhoons, earthquakes, volcanic eruptions, and humanitarian emergency responses.',
        ],
    },
    secretary: {
        key: 'secretary',
        name: 'Dr. Gwendolyn T. Pang',
        title: 'Doctor of Humanities, Secretary General',
        photo: '/images/secretary.jpg',
        bio: [
            'Dr. Gwendolyn Pang has over 25 years of leadership experience in humanitarian works. Dr. Pang is currently the Secretary General of the Philippine Red Cross (PRC).',
            'Prior to her present role, she has held various leadership positions: Member of the Board of Governors of the PRC, Deputy Regional Director for Asia Pacific of the International Federation of Red Cross and Red Crescent Societies (IFRC), Adviser to the International Academy of Red Cross and Red Crescent in Suzhou, China, and Head of East Asia Cluster Delegation.',
            'Dr. Pang developed her passion and expertise toward the areas of public health, organizational development, partnership and resource development, humanitarian diplomacy, disaster management, and resilience building.',
            'Considering her great contributions to humanity in the field of health, disaster management and social welfare, she received the prestigious Florence Nightingale Award, the highest international distinction for a professional nurse to recognize exceptional devotion to victims of armed conflict or natural disasters.',
        ],
    },
};

export const GORDON_ACCORDION_SECTIONS = [
    {
        title: 'Accomplished Fund-Raiser for the Red Cross',
        content: [
            'In 2000, he initiated the PRC Millennium Fund, to which corporate donors pledge contributions to sustain training of volunteers and upgrade rescue and relief equipment.',
            'Through his leadership, PRC acquired heavy rescue trucks equipped with pneumatic spreaders, air lifting bags, amphibious vehicles, and modern blood processing machines.',
        ],
    },
    {
        title: "A Helping Hand for All in Times of Crisis",
        content: [
            'Gordon acts with immediacy during national calamities, leading from the frontlines during major typhoons, earthquakes, volcanic eruptions, and medical emergency responses nationwide.',
        ],
    },
    {
        title: 'Modernizing Philippine Red Cross Operations',
        content: [
            'Under his watch, the Philippine Red Cross was transformed from a traditional first-aid organization into a premier humanitarian institution with a 24/7 Operations Center, fleet of ambulances, humanitarian ships (M/V Amazing Grace), and molecular testing centers.',
        ],
    },
];

export const BOARD_EXECUTIVES = [
    { name: 'Richard J. Gordon', position: 'Chairman & CEO' },
    { name: 'Dr. Gwendolyn T. Pang', position: 'Secretary General' },
    { name: 'Corazon Alma G. De Leon', position: 'Governor / Corporate Secretary' },
    { name: 'Francis Joseph G. Escudero', position: 'Governor' },
    { name: 'Sherwin T. Gatchalian', position: 'Governor' },
    { name: 'Juan Miguel F. Zubiri', position: 'Governor' },
];

export const BOARD_GOVERNORS = [
    'Jorge L. Araneta',
    'Arthur N. Aguilar',
    'Danilo L. Concepcion',
    'Amelita D. Guevara',
    'Margarita Juico',
    'Wilfredo M. Maldia',
    'Monina P. Perez',
    'Hermogenes E. Ebdane Jr.',
    'Rosa Rosal',
    'Andrew O. Nocon',
];

export const EXECUTIVE_STAFF = [
    { name: 'Dr. Gwendolyn T. Pang', position: 'Secretary General', office: 'Office of the Secretary General' },
    { name: 'Leonardo B. Ebajo', position: 'Director', office: 'Disaster Management Services' },
    { name: 'Dr. Christie Monina M. Nalupta', position: 'Director', office: 'National Blood Services' },
    { name: 'Ana P. Moran', position: 'Director', office: 'Welfare Services' },
    { name: 'Alwin O. Baltazar', position: 'Manager', office: 'Logistics and Fleet' },
    { name: 'Rueland Mark K. Marapao', position: 'Manager', office: 'Fund Generation Office' },
];
