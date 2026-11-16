// Site content, taken from the live site (ghausia-research.ae) and lightly
// edited for spelling and consistency. Used at build time to render the pages
// and in the browser by the interactive modules (brief card, clocks, map).

export const site = {
  name: 'Ghausia Marketing Research Consultancy',
  short: 'GMC',
  legal: 'Ghausia Research Inc.',
  email: 'info@ghausia-research.ae',
  linkedin: 'https://www.linkedin.com/company/ghausia-mr-consultancy/',
  tagline: 'Understanding “on-sumers”, inspiring growth',
};

export const offices = [
  {
    id: 'uae', country: 'United Arab Emirates', short: 'UAE', city: 'Sharjah', tz: 'Asia/Dubai',
    lat: 25.2885, lng: 55.4636,
    address: ['Block B, Office B25-061', 'Sharjah Research, Technology and Innovation Park', 'Sharjah, UAE'],
    maps: 'Sharjah Research Technology and Innovation Park',
  },
  {
    id: 'ksa', country: 'Saudi Arabia', short: 'KSA', city: 'Riyadh', tz: 'Asia/Riyadh',
    lat: 24.695, lng: 46.685,
    address: ['Al Olaya Street', 'Al Olaya District', 'Riyadh, KSA'],
    maps: 'Al Olaya Street, Al Olaya, Riyadh',
  },
  {
    id: 'egypt', country: 'Egypt', short: 'Egypt', city: 'Cairo', tz: 'Africa/Cairo',
    lat: 29.9602, lng: 31.2569,
    address: ['Swizz Plaza Building, 80 Street 250', 'Sarayat El Maadi', 'Cairo, Egypt'],
    maps: 'Street 250, Sarayat El Maadi, Cairo',
  },
  {
    id: 'pakistan', country: 'Pakistan', short: 'Pakistan', city: 'Karachi', tz: 'Asia/Karachi',
    lat: 24.918, lng: 67.0971,
    address: ['Plot 27, Office 02, Ground Floor', 'Gulshan-e-Azeem, Scheme 33, University Road', 'Karachi, Pakistan'],
    maps: 'Gulshan-e-Azeem, Scheme 33, University Road, Karachi',
  },
  {
    id: 'usa', country: 'United States', short: 'USA', city: 'Stafford, Texas', cityShort: 'Stafford', tz: 'America/Chicago',
    lat: 29.6161, lng: -95.5577,
    address: ['10701 Corporate Drive, Suite 142', 'Stafford, Texas 77477', 'USA'],
    maps: '10701 Corporate Drive, Stafford, TX 77477',
  },
];

export const serviceGroups = [
  { id: 'quant', name: 'Quantitative and tracking' },
  { id: 'qual', name: 'Qualitative' },
  { id: 'ux', name: 'UX research' },
  { id: 'testing', name: 'Testing and evaluation' },
  { id: 'strategy', name: 'Strategy and markets' },
];

export const services = [
  {
    id: 'quantitative-research', group: 'quant', title: 'Quantitative research',
    short: 'Panels, CAPI, CAWI and face-to-face surveys',
    body: 'We gather numerical data through consumer panels, face-to-face and online surveys, CAPI and CAWI, using structured questionnaires to provide statistically significant insights.',
    methods: ['Consumer panels', 'Face-to-face surveys', 'Online surveys', 'CAPI', 'CAWI', 'Structured questionnaires'],
    image: 'analytics-laptop', alt: 'Laptop showing survey results as charts on a desk',
  },
  {
    id: 'brand-health-tracking', group: 'quant', title: 'Brand health tracking',
    short: 'Trackers for FMCG and tobacco brands',
    body: 'We have conducted numerous brand health tracking studies for clients in the FMCG and tobacco industries, offering insights that enhance brand performance and consumer satisfaction.',
    methods: ['FMCG', 'Tobacco', 'Continuous tracking'],
    image: 'brand-dashboard', alt: 'Analytics dashboard open on a laptop',
  },
  {
    id: 'nps-tracking', group: 'quant', title: 'NPS tracking',
    short: 'Customer loyalty, wave after wave',
    body: 'We have carried out a variety of NPS tracking studies, helping clients gauge customer loyalty and satisfaction and paving the way for stronger brand loyalty and growth.',
    methods: ['Net Promoter Score', 'Loyalty', 'Satisfaction'],
    image: 'shopper', alt: 'Shopper pushing a trolley down a supermarket aisle',
  },
  {
    id: 'customer-satisfaction-surveys', group: 'quant', title: 'Customer satisfaction surveys',
    short: 'Satisfaction and loyalty, measured',
    body: 'We gauge customer satisfaction and loyalty to improve products and services.',
    methods: ['Satisfaction', 'Loyalty', 'Service improvement'],
    image: 'hospitality', alt: 'Waiter serving two guests at a café table',
  },
  {
    id: 'qualitative-research', group: 'qual', title: 'Qualitative research',
    short: 'Interviews, groups, ethnography, shop-alongs',
    body: 'Our qualitative methods explore the whys of consumer motivations and perceptions, using projective techniques in in-depth interviews, focus group discussions, ethnographies, shop-alongs and observation.',
    methods: ['In-depth interviews', 'Focus group discussions', 'Ethnography', 'Shop-alongs', 'Observation', 'Projective techniques'],
    image: 'discussion', alt: 'Two people in discussion at a table with a laptop and notebook',
  },
  {
    id: 'ui-ux-research', group: 'ux', title: 'UI/UX research',
    short: 'Digital experiences people find easy',
    body: 'Elevate user satisfaction and engagement with UI/UX research that optimises digital experiences for your audience. It supports data-driven design decisions, so your digital products are intuitive and user-friendly.',
    methods: ['Usability testing', 'Mobile apps', 'Websites', 'Design decisions'],
    image: 'ux-desk', alt: 'Designer sketching app wireframes beside a smartphone',
  },
  {
    id: 'product-usability-testing', group: 'ux', title: 'Product usability testing',
    short: 'Rigorous tests with real users',
    body: 'We make sure your products meet user needs and are easy to use, through rigorous testing.',
    methods: ['Usability', 'User needs', 'Task testing'],
    image: 'wireframes-tablet', alt: 'Tablet showing wireframes next to a laptop',
  },
  {
    id: 'concept-testing', group: 'testing', title: 'Concept testing',
    short: 'Refine and validate ideas before launch',
    body: 'We have conducted an array of concept testing studies, giving businesses crucial insights to refine and validate their ideas and ensure a successful path to market.',
    methods: ['Idea screening', 'Refinement', 'Validation'],
    image: 'ideas', alt: 'Cupped hands holding a string of small lights',
  },
  {
    id: 'product-pack-tests', group: 'testing', title: 'Product and pack tests',
    short: 'Products and packaging, optimised',
    body: 'We have conducted a multitude of product and pack test studies, using rigorous research methodologies to evaluate and optimise products and packaging for our clients’ success.',
    methods: ['Product tests', 'Pack tests', 'Blind tasting'],
    image: 'taste-test', alt: 'Four blindfolded participants at a product tasting table',
  },
  {
    id: 'ad-campaign-evaluation', group: 'testing', title: 'Ad campaign and communication evaluation',
    short: 'Know which ads work before you spend',
    body: 'We assess the effectiveness of advertising campaigns to optimise marketing spend.',
    methods: ['Ad effectiveness', 'Communication tests', 'Marketing spend'],
    image: 'pencils', alt: 'Two pencils on a bright yellow background',
  },
  {
    id: 'car-clinics', group: 'testing', title: 'Car clinics',
    short: 'Dubai and KSA, for leading car makers',
    body: 'With a proven track record, we have conducted comprehensive car clinic studies in Dubai for renowned automotive brands including Land Rover, Range Rover, BMW, Mercedes, Rolls-Royce and Isuzu, delivering valuable insights and strategies.',
    methods: ['Land Rover', 'Range Rover', 'BMW', 'Mercedes', 'Rolls-Royce', 'Isuzu'],
    image: 'car-clinic-hall', alt: 'Cars arranged in a white hall for a car clinic, seen from above',
  },
  {
    id: 'market-segmentation', group: 'strategy', title: 'Market segmentation studies',
    short: 'Segments by who people are and what they do',
    body: 'We identify distinct market segments based on demographics, psychographics and behaviours.',
    methods: ['Demographics', 'Psychographics', 'Behaviour'],
    image: 'workshop-wall', alt: 'Sticky notes grouped on a workshop wall',
  },
  {
    id: 'market-feasibility-entry-strategy', group: 'strategy', title: 'Market feasibility, trend analysis and entry strategy',
    short: 'New markets, entered with confidence',
    body: 'We specialise in in-depth studies, including market feasibility and entry strategy studies, giving businesses the strategic insights to navigate new markets and opportunities with confidence. We plan and execute market entry strategies, including international expansion, and track industry trends to help clients stay ahead of the curve.',
    methods: ['Feasibility', 'Entry strategy', 'International expansion', 'Trend analysis'],
    image: 'notebook', alt: 'Open notebook and reading glasses on a desk',
  },
  {
    id: 'competitive-intelligence', group: 'strategy', title: 'Competitive intelligence',
    short: 'Your rivals’ strategies and weaknesses',
    body: 'We provide comprehensive competitive analysis, helping clients understand their rivals’ strategies and weaknesses.',
    methods: ['Competitive analysis', 'Rival strategies', 'Market moves'],
    image: 'finance-phone', alt: 'Hand holding a phone in front of market charts',
  },
];

export const industries = [
  {
    id: 'technology', title: 'Technology and UX/UI research',
    summary: 'Market understanding for tech companies, and usability testing for user-centric mobile apps.',
    body: 'In the technology sector, we help tech companies understand their markets and adjust to evolving consumer expectations. We also bring extensive UX/UI research experience, including usability testing and working with designers and product managers to create user-centric mobile applications.',
    highlights: ['Usability testing', 'Mobile applications', 'Designers and product managers'],
    image: 'tech-laptop', alt: 'Laptop open on an interface design',
  },
  {
    id: 'automotive', title: 'Automotive',
    summary: 'Car clinics in Dubai and KSA, plus dealer and showroom performance surveys.',
    body: 'We offer research to automotive companies so they stay competitive and innovative before launching new models. We have conducted extensive car clinics in Dubai and KSA with leading brands such as Land Rover, Jaguar, Nissan and BMW, and we have expertise in dealer and showroom performance surveys.',
    highlights: ['Car clinics in Dubai and KSA', 'Land Rover', 'Jaguar', 'Nissan', 'BMW', 'Dealer and showroom surveys'],
    image: 'car-clinic-row', alt: 'Row of classic cars parked in a bright hall',
  },
  {
    id: 'food-and-beverage', title: 'Food and beverage',
    summary: 'A strong track record in understanding what consumers prefer.',
    body: 'In food and beverage, a keen understanding of consumer preferences is vital, and we have a strong track record in this field.',
    highlights: ['Consumer preferences', 'Shopper behaviour'],
    image: 'shopper', alt: 'Shopper pushing a trolley down a supermarket aisle',
  },
  {
    id: 'fitness', title: 'Fitness',
    summary: 'Exercise routines, gyms, clubs and fitness apps.',
    body: 'In fitness, we help brands understand consumers’ exercise routines and how they fit fitness into their daily lives. We have completed numerous projects for gyms, clubs and the development of fitness mobile apps.',
    highlights: ['Gyms', 'Clubs', 'Fitness apps'],
    image: 'gym', alt: 'Bright gym floor with exercise bikes and weights',
  },
  {
    id: 'healthcare', title: 'Healthcare',
    summary: 'Patient experience, HIV research in African markets and multi-country respiratory studies.',
    body: 'We help healthcare organisations enhance patient experiences, streamline services and adapt to changing regulatory landscapes. We have extensive experience with sensitive topics such as HIV in diverse African markets, and with multi-country projects on upper respiratory diseases.',
    highlights: ['Patient experience', 'HIV research in African markets', 'Upper respiratory diseases', 'Multi-country studies'],
    image: 'healthcare-lab', alt: 'Two clinicians reviewing data on screens',
  },
  {
    id: 'finance-banking', title: 'Finance and banking',
    summary: 'Mystery shopping of branches, U&A studies and mobile banking usability.',
    body: 'We offer data-driven solutions that help financial institutions improve customer satisfaction and grow. We have run mystery shopping studies to evaluate bank branch performance, usage and attitude (U&A) studies on consumers’ banking needs, and usability testing for mobile banking.',
    highlights: ['Mystery shopping', 'U&A studies', 'Mobile banking usability'],
    image: 'finance-phone', alt: 'Hand holding a phone in front of market charts',
  },
  {
    id: 'hospitality', title: 'Hospitality',
    summary: 'Hotels, restaurants, dnata, and airlines including Emirates and Etihad.',
    body: 'Our insights help hospitality businesses tailor their offer to travellers and local customers alike. We have helped hotels optimise amenities based on guest feedback, helped restaurants create menus for diverse tastes, and enabled tour companies like dnata to design experiences that captivate tourists and residents. We have also worked with Emirates and Etihad Airways to understand their customers’ needs.',
    highlights: ['Hotels', 'Restaurants', 'dnata', 'Emirates', 'Etihad Airways'],
    image: 'hospitality', alt: 'Waiter serving two guests at a café table',
  },
  {
    id: 'social-research', title: 'Social research',
    summary: 'Marginalised communities, STEM curricula and positive social change.',
    body: 'With a wealth of experience in social research, we have partnered with diverse clients on projects in the social sector, from the realities of marginalised communities to effective STEM curricula. Our focus throughout has been identifying knowledge gaps and providing actionable insights. After all, it is about positive social change, something we personally believe in.',
    highlights: ['Marginalised communities', 'STEM curricula', 'Knowledge gaps'],
    image: 'community', alt: 'Hands of a group stacked together in the centre',
  },
  {
    id: 'government-public-sector', title: 'Government and public sector',
    summary: 'Ministries in KSA, the UAE and Qatar: Hajj and Umrah, FIFA World Cup 2022, DEWA.',
    body: 'We have worked on numerous research projects for ministries in Saudi Arabia, the United Arab Emirates and Qatar, across a wide range of subjects: improving the Hajj and Umrah journey, boosting engagement among Qataris for the FIFA World Cup 2022, and driving improvements at DEWA and Happiness Centres, among others.',
    highlights: ['Hajj and Umrah journey', 'FIFA World Cup 2022', 'DEWA', 'Happiness Centres'],
    image: 'public-sector', alt: 'Hand touching a diagram of public sector services',
  },
  {
    id: 'qsr', title: 'Quick service restaurants',
    summary: 'Pizza, coffee and donut brands: unmet needs, new verticals, more sales.',
    body: 'We have undertaken numerous projects for QSR brands such as pizza parlours, coffee brands and donut brands, gaining deep insight into their customers, pinpointing unmet needs and identifying opportunities to expand into new business verticals. Our insights and recommendations have helped these businesses increase sales and market share.',
    highlights: ['Pizza', 'Coffee', 'Donuts', 'New business verticals'],
    image: 'restaurant', alt: 'Empty restaurant dining room with dark wood tables',
  },
];

export const testimonials = [
  {
    id: 'dunkin', org: 'Dunkin’', name: 'Sandra Hojeij', role: 'Marketing and Creative Director', place: 'Dunkin’, UAE',
    quote: 'Khalid and his team delivered outstanding qualitative research for our Dunkin’ project. Their insights were thorough, actionable, and directly contributed to the success of our project. Khalid’s professionalism and attention to detail made the entire process seamless. We highly recommend his services to anyone looking for top-notch market research support.',
  },
  {
    id: 'hbl', org: 'HBL', name: 'Naveed Khan', role: 'Head of Research and Insights', place: 'HBL, Pakistan',
    quote: 'Their ability to understand consumers is very powerful. They are aware of a wide range of marketing research methodologies and tools. They always work with professionalism and high integrity. We have worked with them for almost 2 years for Philip Morris brand health trackers and they were excellent in connecting dots between BHTs and our ad-hoc researches, always coming up with trends helping our brand teams make informed decisions.',
  },
  {
    id: 'nana', org: 'NANA', name: 'Nabil Hamdan', role: 'Head of Brand and Insights', place: 'NANA, KSA',
    quote: 'Researchers at Ghausia Consulting are people who are passionate about what they do. Their analytical skills and insights capabilities go beyond expectations. They have all it takes, and even beyond, to drive success. Thanks Ghausia Research for the passion! We love working with you for the past 5 years and count on you in future too.',
  },
  {
    id: 'aldar', org: 'Aldar Properties', name: 'Justin Joseph', role: 'Asst. Vice President, Customer and Market Research', place: 'Aldar Properties, UAE',
    quote: 'I worked with Ghausia Consultancy for a year and I was impressed by their professionalism and strategic approach. They handled a number of challenging projects, with excellent analytical thinking and actionable insights. Their team are good storytellers, with a personality that develops strong relationships with their clients.',
  },
  {
    id: 'kantar', org: 'Kantar', name: 'Murtaza Pacha', role: 'Project Manager', place: 'Kantar, UAE',
    quote: 'Ghausia Research, thanks for your work in handling the analysis and reports. Your team’s dedication and sense of ownership was commendable. Your team also has a very good grasp of the data, making it easier for us to build our stories with your insights and data-infused recommendations. Keep up the good work and we hope to work together again in the near future.',
  },
  {
    id: 'swisscom', org: 'Swisscom', name: 'Teri Pietersen', role: 'Scrum Master', place: 'Swisscom, Netherlands',
    quote: 'Ghausia Research consultants and researchers are very thorough when it comes to marketing trends and solutions. Using their research skills, they will always try to help any company understand how they can become differentiators and eventually become the best in their area. They are extremely passionate about users and how they are impacted, negatively and positively, by decisions made by brands. I believe Ghausia Consultancy would be a great research partner for anyone looking for someone creative, passionate and solution-oriented.',
  },
  {
    id: 'intuit', org: 'Intuit Research', name: 'Carlos Hernandez Jr', role: 'Owner', place: 'Intuit Research, Portugal',
    quote: 'I had the pleasure of collaborating with Ghausia Research Consultancy on a couple of qualitative research projects. Throughout our partnership, I appreciated their commitment to deadlines. They consistently met deadlines and were prompt in their responses. Their expertise in qualitative research was evident and added value to certain segments of our work. Furthermore, they maintained a high level of data integrity and even analysed the minute details in transcripts and reported differences among various consumer segments precisely.',
  },
];

// Named on the live site as clients, project partners or testimonial sources.
// Rendered as plain text, not as logos.
export const clients = [
  'Dunkin’', 'Aldar Properties', 'Kantar', 'Emirates', 'Etihad Airways', 'dnata', 'DEWA', 'HBL', 'NANA',
  'Land Rover', 'Jaguar', 'BMW', 'Mercedes-Benz', 'Rolls-Royce', 'Nissan', 'Isuzu', 'Swisscom', 'Intuit Research',
];

// The two-question brief in the home hero
export const briefNeeds = [
  { id: 'brand', label: 'How people see my brand', services: ['brand-health-tracking', 'nps-tracking', 'customer-satisfaction-surveys'] },
  { id: 'why', label: 'Why customers choose what they choose', services: ['qualitative-research', 'market-segmentation'] },
  { id: 'test', label: 'Whether a concept, product, pack or ad will work', services: ['concept-testing', 'product-pack-tests', 'ad-campaign-evaluation', 'car-clinics'] },
  { id: 'ux', label: 'How easy my app or website is to use', services: ['ui-ux-research', 'product-usability-testing'] },
  { id: 'market', label: 'Whether to enter a new market', services: ['market-feasibility-entry-strategy', 'competitive-intelligence', 'market-segmentation'] },
];

export const briefMarkets = [
  { id: 'uae', label: 'UAE', inText: 'the UAE', office: 'uae' },
  { id: 'ksa', label: 'Saudi Arabia', inText: 'Saudi Arabia', office: 'ksa' },
  { id: 'egypt', label: 'Egypt', inText: 'Egypt', office: 'egypt' },
  { id: 'pakistan', label: 'Pakistan', inText: 'Pakistan', office: 'pakistan' },
  { id: 'usa', label: 'USA', inText: 'the USA', office: 'usa' },
  { id: 'elsewhere', label: 'Elsewhere', inText: 'other markets', office: null },
];
