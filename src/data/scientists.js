const notableFigures = [
    {
        name: "John Snow",
        field: "Epidemiology",
        contributions: "Father of modern epidemiology; traced cholera outbreak in London.",
        years: "1813-1858",
        mdi_icon: "mdi-virus",
        gender: "Male",
        country_of_origin: "United Kingdom"
    },
    {
        name: "Ignaz Semmelweis",
        field: "Medicine",
        contributions: "Introduced handwashing in medical practice, reducing puerperal fever.",
        years: "1818-1865",
        mdi_icon: "mdi-hand-water",
        gender: "Male",
        country_of_origin: "Hungary"
    },
    {
        name: "Florence Nightingale",
        field: "Public Health",
        contributions: "Pioneer in statistical graphics; improved sanitary practices in hospitals.",
        years: "1820-1910",
        mdi_icon: "mdi-hospital",
        gender: "Female",
        country_of_origin: "United Kingdom"
    },
    {
        name: "Edward Jenner",
        field: "Medicine",
        contributions: "Developed the first successful smallpox vaccine.",
        years: "1749-1823",
        mdi_icon: "mdi-needle",
        gender: "Male",
        country_of_origin: "United Kingdom"
    },
    {
        name: "Girolamo Fracastoro",
        field: "Medicine",
        contributions: "Proposed the germ theory of disease.",
        years: "1478-1553",
        mdi_icon: "mdi-microscope",
        gender: "Male",
        country_of_origin: "Italy"
    },
    {
        name: "Sir Richard Doll",
        field: "Epidemiology",
        contributions: "Linked smoking to lung cancer.",
        years: "1912-2005",
        mdi_icon: "mdi-lungs",
        gender: "Male",
        country_of_origin: "United Kingdom"
    },
    {
        name: "Alice Stewart",
        field: "Epidemiology",
        contributions: "Researched the dangers of prenatal X-rays and radiation.",
        years: "1906-2002",
        mdi_icon: "mdi-radiology-box",
        gender: "Female",
        country_of_origin: "United Kingdom"
    },
    {
        name: "William Farr",
        field: "Statistics",
        contributions: "Founder of medical statistics; systematized recording causes of death.",
        years: "1807-1883",
        mdi_icon: "mdi-chart-line",
        gender: "Male",
        country_of_origin: "United Kingdom"
    },
    {
        name: "Joseph Goldberger",
        field: "Epidemiology",
        contributions: "Discovered the dietary cause of pellagra.",
        years: "1874-1929",
        mdi_icon: "mdi-food-apple",
        gender: "Male",
        country_of_origin: "United States"
    },
    {
        name: "Janet Lane-Claypon",
        field: "Epidemiology",
        contributions: "Pioneer in cancer research, especially breast cancer.",
        years: "1877-1967",
        mdi_icon: "mdi-ribbon",
        gender: "Female",
        country_of_origin: "United Kingdom"
    },
    {
        name: "Louis Pasteur",
        field: "Microbiology",
        contributions: "Developed pasteurization and vaccines for rabies and anthrax.",
        years: "1822-1895",
        mdi_icon: "mdi-bacteria",
        gender: "Male",
        country_of_origin: "France"
    },
    {
        name: "Robert Koch",
        field: "Microbiology",
        contributions: "Identified causative agents of tuberculosis, cholera, and anthrax.",
        years: "1843-1910",
        mdi_icon: "mdi-biohazard",
        gender: "Male",
        country_of_origin: "Germany"
    },
    {
        name: "Alexander Fleming",
        field: "Medicine",
        contributions: "Discovered penicillin.",
        years: "1881-1955",
        mdi_icon: "mdi-pill",
        gender: "Male",
        country_of_origin: "United Kingdom"
    },
    {
        name: "Paul Ehrlich",
        field: "Immunology",
        contributions: "Developed first cure for syphilis; advanced immunology.",
        years: "1854-1915",
        mdi_icon: "mdi-shield-plus",
        gender: "Male",
        country_of_origin: "Germany"
    },
    {
        name: "Barbara McClintock",
        field: "Genetics",
        contributions: "Discovered transposable elements (jumping genes).",
        years: "1902-1992",
        mdi_icon: "mdi-dna",
        gender: "Female",
        country_of_origin: "United States"
    },
    {
        name: "Rosalind Franklin",
        field: "Biophysics",
        contributions: "Contributed to understanding DNA, RNA, viruses.",
        years: "1920-1958",
        mdi_icon: "mdi-molecule",
        gender: "Female",
        country_of_origin: "United Kingdom"
    },
    {
        name: "James Watson",
        field: "Genetics",
        contributions: "Co-discovered the double-helix structure of DNA.",
        years: "1928-present",
        mdi_icon: "mdi-dna",
        gender: "Male",
        country_of_origin: "United States"
    },
    {
        name: "Francis Crick",
        field: "Genetics",
        contributions: "Co-discovered the double-helix structure of DNA.",
        years: "1916-2004",
        mdi_icon: "mdi-dna",
        gender: "Male",
        country_of_origin: "United Kingdom"
    },
    {
        name: "Gregor Mendel",
        field: "Genetics",
        contributions: "Father of genetics; worked on inheritance of traits in pea plants.",
        years: "1822-1884",
        mdi_icon: "mdi-flower",
        gender: "Male",
        country_of_origin: "Austria"
    },
    {
        name: "Maurice Hilleman",
        field: "Virology",
        contributions: "Developed over 40 vaccines, including for measles and mumps.",
        years: "1919-2005",
        mdi_icon: "mdi-virus",
        gender: "Male",
        country_of_origin: "United States"
    },
    {
        name: "Katalin Karikó",
        field: "Biochemistry",
        contributions: "Pioneered mRNA technology for COVID-19 vaccines.",
        years: "1955-present",
        mdi_icon: "mdi-dna",
        gender: "Female",
        country_of_origin: "Hungary"
    },
    {
        name: "Ronald Ross",
        field: "Epidemiology",
        contributions: "Discovered malaria parasite in mosquitoes.",
        years: "1857-1932",
        mdi_icon: "mdi-virus",
        gender: "Male",
        country_of_origin: "United Kingdom"
    },
    {
        name: "Max von Pettenkofer",
        field: "Public Health",
        contributions: "Promoted sanitation and hygiene in urban areas.",
        years: "1818-1901",
        mdi_icon: "mdi-city",
        gender: "Male",
        country_of_origin: "Germany"
    },
    {
        name: "Thomas Sydenham",
        field: "Medicine",
        contributions: "English Hippocrates; emphasized clinical observation.",
        years: "1624-1689",
        mdi_icon: "mdi-doctor",
        gender: "Male",
        country_of_origin: "United Kingdom"
    },
    {
        name: "Andreas Vesalius",
        field: "Anatomy",
        contributions: "Founder of modern human anatomy.",
        years: "1514-1564",
        mdi_icon: "mdi-human-male",
        gender: "Male",
        country_of_origin: "Belgium"
    },
    {
        name: "Hippocrates",
        field: "Medicine",
        contributions: "Father of Medicine; Hippocratic Oath.",
        years: "460-370 BC",
        mdi_icon: "mdi-doctor",
        gender: "Male",
        country_of_origin: "Greece"
    },
    {
        name: "William Harvey",
        field: "Physiology",
        contributions: "Described the circulation of blood.",
        years: "1578-1657",
        mdi_icon: "mdi-heart-pulse",
        gender: "Male",
        country_of_origin: "United Kingdom"
    },
    {
        name: "Alfred Grotjahn",
        field: "Social Medicine",
        contributions: "Pioneer in social hygiene and social medicine.",
        years: "1869-1931",
        mdi_icon: "mdi-hand-heart",
        gender: "Male",
        country_of_origin: "Germany"
    },
    {
        name: "Alfred Blalock",
        field: "Surgery",
        contributions: "Developed the first successful open heart surgery techniques.",
        years: "1899-1964",
        mdi_icon: "mdi-account-injury-outline",
        gender: "Male",
        country_of_origin: "United States"
    },
    {
        name: "Harvey Cushing",
        field: "Neurosurgery",
        contributions: "Pioneer of brain surgery techniques.",
        years: "1869-1939",
        mdi_icon: "mdi-brain",
        gender: "Male",
        country_of_origin: "United States"
    }
];


export default notableFigures;
// kipkilimo@gmail.com oAUJAKu7B7hP