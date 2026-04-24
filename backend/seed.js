const pool = require('./db');
const bcrypt = require('bcryptjs');

async function seed() {
  const client = await pool.connect();
  try {
    // Drop and recreate all tables
    await client.query(`
      DROP TABLE IF EXISTS ancient_ancestry CASCADE;
      DROP TABLE IF EXISTS heritage_reports CASCADE;
      DROP TABLE IF EXISTS heritage_recipes CASCADE;
      DROP TABLE IF EXISTS genealogy_documents CASCADE;
      DROP TABLE IF EXISTS dna_matches CASCADE;
      DROP TABLE IF EXISTS surname_origins CASCADE;
      DROP TABLE IF EXISTS cultural_heritage CASCADE;
      DROP TABLE IF EXISTS ancestor_timelines CASCADE;
      DROP TABLE IF EXISTS genetic_traits CASCADE;
      DROP TABLE IF EXISTS haplogroups CASCADE;
      DROP TABLE IF EXISTS family_relationships CASCADE;
      DROP TABLE IF EXISTS migration_patterns CASCADE;
      DROP TABLE IF EXISTS health_risks CASCADE;
      DROP TABLE IF EXISTS ancestors CASCADE;
      DROP TABLE IF EXISTS ethnicity_analyses CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    // Create tables
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE ethnicity_analyses (
        id SERIAL PRIMARY KEY,
        region VARCHAR(255) NOT NULL,
        sub_region VARCHAR(255) NOT NULL,
        percentage DECIMAL(5,2) NOT NULL,
        confidence VARCHAR(50) NOT NULL,
        population_reference VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE ancestors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        birth_year INTEGER,
        death_year INTEGER,
        birth_place VARCHAR(255),
        death_place VARCHAR(255),
        occupation VARCHAR(255),
        relationship VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE health_risks (
        id SERIAL PRIMARY KEY,
        condition VARCHAR(255) NOT NULL,
        gene VARCHAR(100) NOT NULL,
        variant VARCHAR(100) NOT NULL,
        risk_level VARCHAR(50) NOT NULL,
        risk_percentage DECIMAL(5,2),
        category VARCHAR(100),
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE migration_patterns (
        id SERIAL PRIMARY KEY,
        origin VARCHAR(255) NOT NULL,
        destination VARCHAR(255) NOT NULL,
        era VARCHAR(100) NOT NULL,
        year_range VARCHAR(100),
        reason VARCHAR(255),
        route VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE family_relationships (
        id SERIAL PRIMARY KEY,
        person_name VARCHAR(255) NOT NULL,
        relationship_type VARCHAR(100) NOT NULL,
        shared_cm DECIMAL(8,2) NOT NULL,
        shared_segments INTEGER NOT NULL,
        confidence DECIMAL(5,2),
        match_date DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE haplogroups (
        id SERIAL PRIMARY KEY,
        haplogroup VARCHAR(50) NOT NULL,
        type VARCHAR(20) NOT NULL,
        origin_region VARCHAR(255),
        age VARCHAR(100),
        description TEXT,
        migration_path TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE genetic_traits (
        id SERIAL PRIMARY KEY,
        trait_name VARCHAR(255) NOT NULL,
        predicted_outcome VARCHAR(255) NOT NULL,
        gene VARCHAR(100),
        variant VARCHAR(100),
        probability DECIMAL(5,2),
        category VARCHAR(100),
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE ancestor_timelines (
        id SERIAL PRIMARY KEY,
        ancestor_name VARCHAR(255) NOT NULL,
        event_type VARCHAR(100) NOT NULL,
        year INTEGER NOT NULL,
        location VARCHAR(255),
        description TEXT,
        source VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE cultural_heritage (
        id SERIAL PRIMARY KEY,
        culture_name VARCHAR(255) NOT NULL,
        region VARCHAR(255) NOT NULL,
        tradition VARCHAR(255) NOT NULL,
        time_period VARCHAR(100),
        category VARCHAR(100),
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE surname_origins (
        id SERIAL PRIMARY KEY,
        surname VARCHAR(255) NOT NULL,
        origin_language VARCHAR(100) NOT NULL,
        origin_country VARCHAR(100) NOT NULL,
        meaning VARCHAR(255),
        first_recorded VARCHAR(100),
        category VARCHAR(100),
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE dna_matches (
        id SERIAL PRIMARY KEY,
        match_name VARCHAR(255) NOT NULL,
        shared_cm DECIMAL(8,2) NOT NULL,
        shared_segments INTEGER NOT NULL,
        chromosomes VARCHAR(255),
        predicted_relationship VARCHAR(100),
        confidence DECIMAL(5,2),
        match_date DATE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE genealogy_documents (
        id SERIAL PRIMARY KEY,
        document_type VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        document_date VARCHAR(100),
        location VARCHAR(255),
        person_name VARCHAR(255),
        content_summary TEXT,
        source VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE heritage_recipes (
        id SERIAL PRIMARY KEY,
        recipe_name VARCHAR(255) NOT NULL,
        origin_region VARCHAR(255) NOT NULL,
        origin_country VARCHAR(100) NOT NULL,
        cuisine_type VARCHAR(100),
        era VARCHAR(100),
        key_ingredients TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE heritage_reports (
        id SERIAL PRIMARY KEY,
        report_type VARCHAR(100) NOT NULL,
        subject_name VARCHAR(255) NOT NULL,
        summary TEXT,
        key_findings TEXT,
        regions VARCHAR(255),
        time_span VARCHAR(100),
        status VARCHAR(50) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE ancient_ancestry (
        id SERIAL PRIMARY KEY,
        population_name VARCHAR(255) NOT NULL,
        region VARCHAR(255) NOT NULL,
        time_period VARCHAR(100) NOT NULL,
        affinity_percentage DECIMAL(5,2),
        description TEXT,
        archaeological_sites VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Seed demo user
    const hashedPassword = await bcrypt.hash('demo123', 10);
    await client.query(
      `INSERT INTO users (email, password, name) VALUES ($1, $2, $3)`,
      ['demo@genealogy.com', hashedPassword, 'Demo User']
    );

    // Seed ethnicity_analyses (15 items)
    await client.query(`
      INSERT INTO ethnicity_analyses (region, sub_region, percentage, confidence, population_reference) VALUES
      ('Europe', 'Northwestern Europe - British Isles', 32.50, 'High', 'GBR reference panel'),
      ('Europe', 'Germanic Europe', 18.20, 'High', 'DEU reference panel'),
      ('Europe', 'Scandinavian', 12.80, 'Medium', 'SWE/NOR reference panel'),
      ('Europe', 'Eastern Europe - Slavic', 8.50, 'Medium', 'POL/RUS reference panel'),
      ('Africa', 'West African - Nigerian', 7.30, 'High', 'NGA reference panel'),
      ('Europe', 'Irish & Scottish', 5.40, 'High', 'IRL/SCT reference panel'),
      ('Asia', 'Central Asian', 3.20, 'Low', 'KAZ reference panel'),
      ('Europe', 'Southern Europe - Italian', 2.80, 'Medium', 'ITA reference panel'),
      ('Americas', 'Indigenous American', 2.50, 'Medium', 'NAM reference panel'),
      ('Europe', 'Iberian Peninsula', 1.90, 'Low', 'ESP/PRT reference panel'),
      ('Middle East', 'Levantine', 1.60, 'Low', 'LBN reference panel'),
      ('Africa', 'East African', 1.20, 'Low', 'ETH reference panel'),
      ('Europe', 'French', 0.90, 'Low', 'FRA reference panel'),
      ('Asia', 'South Asian', 0.70, 'Low', 'IND reference panel'),
      ('Europe', 'Baltic States', 0.50, 'Low', 'LTU/LVA reference panel')
    `);

    // Seed ancestors (15 items)
    await client.query(`
      INSERT INTO ancestors (name, birth_year, death_year, birth_place, death_place, occupation, relationship, notes) VALUES
      ('William James Harrison', 1845, 1912, 'Liverpool, England', 'Boston, Massachusetts', 'Ship Captain', 'Great-Great-Grandfather', 'Immigrated to America in 1870'),
      ('Margaret Anne O''Brien', 1850, 1920, 'County Cork, Ireland', 'Boston, Massachusetts', 'Seamstress', 'Great-Great-Grandmother', 'Fled during Irish famine aftermath'),
      ('Friedrich Wilhelm Müller', 1838, 1905, 'Stuttgart, Germany', 'Milwaukee, Wisconsin', 'Brewmaster', 'Great-Great-Grandfather', 'Founded local brewery in 1875'),
      ('Ingrid Johansson', 1860, 1935, 'Gothenburg, Sweden', 'Minneapolis, Minnesota', 'Midwife', 'Great-Great-Grandmother', 'Delivered over 500 babies'),
      ('Thomas Edward Harrison', 1872, 1945, 'Boston, Massachusetts', 'Boston, Massachusetts', 'Doctor', 'Great-Grandfather', 'Harvard Medical School graduate'),
      ('Anna Müller', 1875, 1950, 'Milwaukee, Wisconsin', 'Chicago, Illinois', 'Teacher', 'Great-Grandmother', 'Taught for 35 years'),
      ('James Patrick O''Brien', 1820, 1880, 'Dublin, Ireland', 'County Cork, Ireland', 'Farmer', 'Great-Great-Great-Grandfather', 'Survived the Great Famine'),
      ('Elsa Bergström', 1835, 1900, 'Stockholm, Sweden', 'Gothenburg, Sweden', 'Weaver', 'Great-Great-Great-Grandmother', 'Known for intricate textile work'),
      ('Robert Charles Harrison', 1900, 1970, 'Boston, Massachusetts', 'New York, New York', 'Journalist', 'Grandfather', 'Covered WWII for The Times'),
      ('Dorothy Mae Müller', 1905, 1985, 'Chicago, Illinois', 'New York, New York', 'Nurse', 'Grandmother', 'Served in Army Nurse Corps WWII'),
      ('Heinrich Müller', 1810, 1875, 'Bavaria, Germany', 'Stuttgart, Germany', 'Blacksmith', 'Great-Great-Great-Grandfather', 'Master craftsman guild member'),
      ('Bridget Mary Kelly', 1825, 1890, 'Galway, Ireland', 'County Cork, Ireland', 'Homemaker', 'Great-Great-Great-Grandmother', 'Raised eight children'),
      ('Erik Johansson', 1830, 1895, 'Uppsala, Sweden', 'Gothenburg, Sweden', 'Fisherman', 'Great-Great-Great-Grandfather', 'Lost at sea during storm'),
      ('Catherine Rose Harrison', 1870, 1940, 'Liverpool, England', 'Boston, Massachusetts', 'Governess', 'Great-Great-Aunt', 'Never married, educated nephew'),
      ('Walter James Harrison', 1935, 2010, 'New York, New York', 'Hartford, Connecticut', 'Engineer', 'Father', 'MIT graduate, aerospace engineer')
    `);

    // Seed health_risks (15 items)
    await client.query(`
      INSERT INTO health_risks (condition, gene, variant, risk_level, risk_percentage, category, description) VALUES
      ('Type 2 Diabetes', 'TCF7L2', 'rs7903146-T', 'Moderate', 25.00, 'Metabolic', 'Common variant associated with increased diabetes risk'),
      ('Coronary Artery Disease', 'CDKN2A/2B', 'rs10757278-G', 'Low', 15.00, 'Cardiovascular', 'Variant near cell cycle regulation genes'),
      ('Age-Related Macular Degeneration', 'CFH', 'rs1061170-C', 'Moderate', 30.00, 'Vision', 'Complement factor H variant'),
      ('Celiac Disease', 'HLA-DQ2', 'DQ2.5', 'High', 45.00, 'Autoimmune', 'Major genetic risk factor for celiac disease'),
      ('Alzheimer''s Disease', 'APOE', 'e3/e4', 'Moderate', 20.00, 'Neurological', 'One copy of APOE4 allele increases risk'),
      ('Breast Cancer', 'BRCA1', 'rs80357713', 'Low', 12.00, 'Cancer', 'Specific variant with moderate penetrance'),
      ('Parkinson''s Disease', 'LRRK2', 'G2019S', 'Low', 8.00, 'Neurological', 'Most common genetic cause of Parkinson''s'),
      ('Hemochromatosis', 'HFE', 'C282Y', 'High', 50.00, 'Metabolic', 'Iron overload disorder carrier status'),
      ('Rheumatoid Arthritis', 'HLA-DRB1', 'SE alleles', 'Moderate', 22.00, 'Autoimmune', 'Shared epitope alleles increase risk'),
      ('Lactose Intolerance', 'MCM6', 'rs4988235-C', 'High', 65.00, 'Digestive', 'European lactase persistence variant'),
      ('Thrombophilia', 'F5', 'Factor V Leiden', 'Moderate', 18.00, 'Blood', 'Increased risk of blood clots'),
      ('Cystic Fibrosis Carrier', 'CFTR', 'deltaF508', 'Low', 4.00, 'Respiratory', 'Carrier status - one copy of mutation'),
      ('Psoriasis', 'HLA-C', 'HLA-Cw6', 'Moderate', 28.00, 'Skin', 'Major susceptibility allele for psoriasis'),
      ('Glaucoma', 'MYOC', 'rs74315329', 'Low', 10.00, 'Vision', 'Myocilin gene variant associated with glaucoma'),
      ('Migraine with Aura', 'MTHFR', 'C677T', 'Moderate', 35.00, 'Neurological', 'Folate metabolism variant linked to migraines')
    `);

    // Seed migration_patterns (15 items)
    await client.query(`
      INSERT INTO migration_patterns (origin, destination, era, year_range, reason, route, description) VALUES
      ('Liverpool, England', 'Boston, Massachusetts', 'Victorian', '1860-1880', 'Economic opportunity', 'Transatlantic sea route', 'Part of the great British emigration wave'),
      ('County Cork, Ireland', 'Boston, Massachusetts', 'Post-Famine', '1850-1870', 'Famine aftermath', 'Cork to Queenstown to Boston', 'Irish diaspora following the Great Famine'),
      ('Stuttgart, Germany', 'Milwaukee, Wisconsin', 'German Migration', '1870-1890', 'Political unrest', 'Hamburg to New York to Great Lakes', 'German-American immigration wave'),
      ('Gothenburg, Sweden', 'Minneapolis, Minnesota', 'Scandinavian Wave', '1880-1900', 'Land scarcity', 'Gothenburg to Liverpool to New York', 'Swedish emigration to American Midwest'),
      ('Bavaria, Germany', 'Stuttgart, Germany', 'Industrial Revolution', '1830-1860', 'Industrialization', 'Overland through Württemberg', 'Rural to urban migration within Germany'),
      ('Central Africa', 'West Africa', 'Bantu Expansion', '1000 BCE-500 CE', 'Agricultural expansion', 'Congo Basin routes', 'Ancient Bantu migration across Africa'),
      ('Pontic Steppe', 'Western Europe', 'Bronze Age', '3000-2500 BCE', 'Pastoral expansion', 'Danube River corridor', 'Yamnaya migration into Europe'),
      ('Fertile Crescent', 'Mediterranean Europe', 'Neolithic', '7000-4000 BCE', 'Agricultural spread', 'Coastal Mediterranean route', 'First farmers entering Europe'),
      ('East Africa', 'Arabian Peninsula', 'Out of Africa', '70000 BCE', 'Exploration', 'Bab el-Mandeb strait', 'Human migration out of Africa'),
      ('Galway, Ireland', 'County Cork, Ireland', 'Pre-Famine', '1810-1830', 'Marriage', 'Western Ireland overland', 'Internal Irish migration'),
      ('Uppsala, Sweden', 'Gothenburg, Sweden', 'Pre-Industrial', '1820-1840', 'Trade opportunities', 'Swedish lake routes', 'Internal Swedish migration to port city'),
      ('New York, New York', 'Hartford, Connecticut', 'Post-War', '1950-1960', 'Suburban growth', 'I-95 corridor', 'Post-WWII suburban migration'),
      ('Boston, Massachusetts', 'New York, New York', 'Early 20th Century', '1920-1940', 'Career advancement', 'Northeast corridor', 'Urban professional migration'),
      ('Siberia', 'Alaska', 'Ice Age', '15000 BCE', 'Following game', 'Beringia land bridge', 'First Americans crossing into the New World'),
      ('Anatolia', 'British Isles', 'Neolithic', '4000-3000 BCE', 'Agricultural expansion', 'Atlantic coastal route', 'Neolithic farmers reaching Britain')
    `);

    // Seed family_relationships (15 items)
    await client.query(`
      INSERT INTO family_relationships (person_name, relationship_type, shared_cm, shared_segments, confidence, match_date, notes) VALUES
      ('Sarah Miller', '2nd Cousin', 212.50, 14, 95.00, '2024-01-15', 'Shares great-grandparent William Harrison'),
      ('John O''Brien', '3rd Cousin', 78.30, 8, 85.00, '2024-02-20', 'Irish line connection through O''Brien family'),
      ('Emma Johansson', '2nd Cousin Once Removed', 145.00, 11, 90.00, '2024-03-10', 'Swedish ancestry connection'),
      ('Michael Harrison', '1st Cousin', 850.00, 32, 99.00, '2024-01-05', 'Known cousin - confirmed match'),
      ('Lisa Müller-Schmidt', '3rd Cousin', 65.20, 6, 80.00, '2024-04-18', 'German line through Müller family'),
      ('David Chen', '4th Cousin', 35.00, 4, 60.00, '2024-05-22', 'Unexpected match - researching connection'),
      ('Karen Johnson', 'Half 2nd Cousin', 110.00, 9, 75.00, '2024-06-30', 'May indicate unknown family branch'),
      ('Robert Harrison III', '1st Cousin Once Removed', 425.00, 22, 98.00, '2024-02-14', 'Father''s cousin''s son'),
      ('Patricia Kelly', '3rd Cousin', 55.80, 5, 70.00, '2024-07-08', 'Irish connection through Kelly line'),
      ('Thomas Bergström', '4th Cousin', 28.50, 3, 55.00, '2024-08-15', 'Swedish line - Bergström connection'),
      ('Jennifer Adams', '2nd Cousin', 195.00, 13, 92.00, '2024-03-25', 'Shares great-grandparents on maternal side'),
      ('William O''Brien Jr', '2nd Cousin Once Removed', 160.00, 12, 88.00, '2024-09-01', 'O''Brien family - Boston branch'),
      ('Anna Lindqvist', '5th Cousin', 18.50, 2, 40.00, '2024-10-12', 'Distant Swedish match'),
      ('Mark Harrison', 'Half Sibling', 1750.00, 45, 99.50, '2024-01-02', 'Previously unknown half-sibling - same father'),
      ('Sophie Weber', '3rd Cousin Once Removed', 42.00, 4, 65.00, '2024-11-20', 'German line connection')
    `);

    // Seed haplogroups (15 items)
    await client.query(`
      INSERT INTO haplogroups (haplogroup, type, origin_region, age, description, migration_path) VALUES
      ('R1b-M269', 'paternal', 'Western Europe', '4,000-6,000 years', 'Most common Y-DNA haplogroup in Western Europe', 'Pontic Steppe → Central Europe → Western Europe'),
      ('H1', 'maternal', 'Franco-Cantabrian Region', '10,000-15,000 years', 'Most common European mtDNA haplogroup', 'Ice Age refugia → Post-glacial expansion across Europe'),
      ('I1', 'paternal', 'Scandinavia', '4,000-5,000 years', 'Characteristic Scandinavian Y-DNA haplogroup', 'Northern Europe → Viking expansion'),
      ('J2', 'paternal', 'Fertile Crescent', '15,000-20,000 years', 'Associated with Neolithic expansion', 'Mesopotamia → Mediterranean → Europe'),
      ('U5', 'maternal', 'Western Europe', '30,000-50,000 years', 'One of the oldest European mtDNA haplogroups', 'Pre-Ice Age Europe → Survived in refugia'),
      ('R1a-M420', 'paternal', 'Eastern Europe/Central Asia', '5,000-10,000 years', 'Common in Eastern Europe and South Asia', 'Pontic Steppe → Eastern Europe & India'),
      ('K1', 'maternal', 'Near East', '12,000-20,000 years', 'Widespread haplogroup of Neolithic origin', 'Near East → Europe with farming expansion'),
      ('E1b1b', 'paternal', 'East Africa/Horn of Africa', '20,000-25,000 years', 'Most common in North Africa and Horn of Africa', 'East Africa → North Africa → Mediterranean'),
      ('T2', 'maternal', 'Near East', '10,000-15,000 years', 'Associated with Neolithic expansion into Europe', 'Fertile Crescent → Mediterranean Europe'),
      ('G2a', 'paternal', 'Caucasus Region', '10,000-15,000 years', 'Associated with early European farmers', 'Caucasus → Anatolia → Europe'),
      ('HV', 'maternal', 'Near East', '20,000-25,000 years', 'Ancestral to haplogroups H and V', 'Near East → Europe during multiple waves'),
      ('N1c', 'paternal', 'Siberia/Northeast Asia', '10,000-15,000 years', 'Common among Finno-Ugric and Baltic peoples', 'Siberia → Ural region → Northern Europe'),
      ('J1', 'maternal', 'Near East', '30,000-45,000 years', 'Widespread across Europe and Near East', 'Near East → Europe via multiple routes'),
      ('L', 'maternal', 'Africa', '100,000-150,000 years', 'Root of all human maternal lineages', 'Origin of all modern humans in Africa'),
      ('Q', 'paternal', 'Central Asia/Siberia', '15,000-20,000 years', 'Found in Native Americans and Central Asians', 'Central Asia → Siberia → Americas via Beringia')
    `);

    // Seed genetic_traits (15 items)
    await client.query(`
      INSERT INTO genetic_traits (trait_name, predicted_outcome, gene, variant, probability, category, description) VALUES
      ('Eye Color', 'Blue/Green', 'OCA2/HERC2', 'rs12913832-G', 85.00, 'Appearance', 'Strong predictor of light eye color'),
      ('Hair Color', 'Light Brown', 'MC1R', 'rs1805007-C', 70.00, 'Appearance', 'Variant associated with lighter hair'),
      ('Earwax Type', 'Wet', 'ABCC11', 'rs17822931-C', 95.00, 'Physical', 'Determines wet vs dry earwax'),
      ('Bitter Taste Perception', 'Taster', 'TAS2R38', 'rs713598-C', 75.00, 'Sensory', 'Ability to taste bitter compounds like PTC'),
      ('Caffeine Metabolism', 'Fast Metabolizer', 'CYP1A2', 'rs762551-A', 80.00, 'Metabolism', 'Rapid caffeine processing'),
      ('Muscle Composition', 'Mixed Endurance/Power', 'ACTN3', 'rs1815739-CT', 65.00, 'Athletic', 'Heterozygous for sprint/power gene'),
      ('Freckling', 'Likely Freckles', 'MC1R', 'rs1805008-T', 72.00, 'Appearance', 'Associated with freckling tendency'),
      ('Asparagus Smell Detection', 'Can Detect', 'OR2M7', 'rs4481887-G', 88.00, 'Sensory', 'Ability to smell asparagus metabolites'),
      ('Sleep Depth', 'Deep Sleeper', 'ADA', 'rs73598374-G', 60.00, 'Behavioral', 'Associated with deeper sleep patterns'),
      ('Alcohol Flush Reaction', 'No Flush', 'ALDH2', 'rs671-G', 92.00, 'Metabolism', 'Normal alcohol metabolism'),
      ('Photic Sneeze Reflex', 'Likely Sneezer', 'ACHOO locus', 'rs10427255-C', 55.00, 'Physical', 'Sneezing triggered by bright light'),
      ('Cleft Chin', 'Slight Cleft', 'Multiple', 'Polygenic', 45.00, 'Appearance', 'Multiple genes influence chin morphology'),
      ('Hair Curl', 'Wavy Hair', 'TCHH', 'rs11803731-A', 68.00, 'Appearance', 'Trichohyalin gene variant for hair texture'),
      ('Pain Sensitivity', 'Lower Sensitivity', 'SCN9A', 'rs6746030-A', 58.00, 'Sensory', 'Sodium channel variant affecting pain'),
      ('Circadian Rhythm', 'Morning Person', 'PER2', 'rs2304672-C', 63.00, 'Behavioral', 'Clock gene variant favoring early rising')
    `);

    // Seed ancestor_timelines (15 items)
    await client.query(`
      INSERT INTO ancestor_timelines (ancestor_name, event_type, year, location, description, source) VALUES
      ('William James Harrison', 'Birth', 1845, 'Liverpool, England', 'Born to a merchant family in the port city', 'Parish records'),
      ('William James Harrison', 'Immigration', 1870, 'Boston, Massachusetts', 'Arrived at Boston Harbor on the SS Britannic', 'Ship manifest records'),
      ('Margaret Anne O''Brien', 'Birth', 1850, 'County Cork, Ireland', 'Born during the aftermath of the Great Famine', 'Catholic parish records'),
      ('Margaret Anne O''Brien', 'Marriage', 1872, 'Boston, Massachusetts', 'Married William Harrison at St. Patrick''s Church', 'Marriage certificate'),
      ('Friedrich Wilhelm Müller', 'Birth', 1838, 'Stuttgart, Germany', 'Born to a middle-class German family', 'German civil records'),
      ('Friedrich Wilhelm Müller', 'Immigration', 1875, 'New York, New York', 'Entered through Castle Garden immigration center', 'Immigration records'),
      ('Ingrid Johansson', 'Birth', 1860, 'Gothenburg, Sweden', 'Born in Sweden''s second largest city', 'Swedish church records'),
      ('Thomas Edward Harrison', 'Graduation', 1898, 'Boston, Massachusetts', 'Graduated from Harvard Medical School', 'University records'),
      ('Robert Charles Harrison', 'Military Service', 1942, 'London, England', 'Served as war correspondent during WWII', 'Military service records'),
      ('Dorothy Mae Müller', 'Military Service', 1943, 'North Africa', 'Served as Army nurse during North African campaign', 'Army Nurse Corps records'),
      ('James Patrick O''Brien', 'Survived Famine', 1847, 'County Cork, Ireland', 'Survived Black ''47, the worst year of the famine', 'Historical accounts'),
      ('Heinrich Müller', 'Guild Membership', 1835, 'Stuttgart, Germany', 'Accepted as master blacksmith in local guild', 'Guild records'),
      ('Erik Johansson', 'Death', 1895, 'North Sea', 'Lost at sea during a devastating winter storm', 'Maritime records'),
      ('Walter James Harrison', 'Graduation', 1957, 'Cambridge, Massachusetts', 'Graduated from MIT with engineering degree', 'University records'),
      ('Catherine Rose Harrison', 'Immigration', 1892, 'Boston, Massachusetts', 'Followed brother William to America', 'Ellis Island records')
    `);

    // Seed cultural_heritage (15 items)
    await client.query(`
      INSERT INTO cultural_heritage (culture_name, region, tradition, time_period, category, description) VALUES
      ('Victorian English', 'British Isles', 'Afternoon Tea Ceremony', '1840-1900', 'Food & Drink', 'Formal afternoon tea became a social institution'),
      ('Irish Celtic', 'Ireland', 'Storytelling & Seanchaí', '500 CE-Present', 'Oral Tradition', 'Traditional Irish storytelling passed through generations'),
      ('German Bavarian', 'Southern Germany', 'Oktoberfest Celebration', '1810-Present', 'Festival', 'Annual festival celebrating Bavarian culture'),
      ('Swedish Viking', 'Scandinavia', 'Midsommar Festival', '800 CE-Present', 'Festival', 'Summer solstice celebration with ancient roots'),
      ('Irish Catholic', 'Ireland', 'Wake Traditions', '1700-Present', 'Funeral', 'Traditional Irish funeral customs and gatherings'),
      ('German Christmas', 'Germany', 'Weihnachten Traditions', '1600-Present', 'Holiday', 'Christmas tree, Advent calendar, and Stollen cake'),
      ('English Maritime', 'British Isles', 'Seafaring Traditions', '1500-1900', 'Occupation', 'Customs and superstitions of English sailors'),
      ('Swedish Folk', 'Scandinavia', 'Dala Horse Crafting', '1600-Present', 'Crafts', 'Traditional carved and painted wooden horses'),
      ('Irish Music', 'Ireland', 'Traditional Session Music', '1700-Present', 'Music', 'Informal gatherings for playing traditional Irish music'),
      ('German Guild', 'Germany', 'Meister System', '1200-1900', 'Occupation', 'Master craftsman training and guild system'),
      ('Celtic Spiritual', 'British Isles & Ireland', 'Samhain Festival', '500 BCE-Present', 'Spiritual', 'Ancient Celtic new year and harvest festival'),
      ('Scandinavian Winter', 'Scandinavia', 'Lucia Day Celebration', '1700-Present', 'Holiday', 'Festival of lights on December 13th'),
      ('English Garden', 'British Isles', 'Cottage Garden Tradition', '1500-Present', 'Lifestyle', 'Informal garden style originating with cottage dwellers'),
      ('Irish Dance', 'Ireland', 'Step Dancing', '1700-Present', 'Dance', 'Traditional Irish step dance forms'),
      ('German Philosophical', 'Germany', 'Wanderlust Tradition', '1800-Present', 'Lifestyle', 'German tradition of hiking and nature exploration')
    `);

    // Seed surname_origins (15 items)
    await client.query(`
      INSERT INTO surname_origins (surname, origin_language, origin_country, meaning, first_recorded, category, description) VALUES
      ('Harrison', 'English', 'England', 'Son of Harry/Henry', '13th century', 'Patronymic', 'Derived from the medieval given name Harry'),
      ('O''Brien', 'Irish Gaelic', 'Ireland', 'Descendant of Brian', '10th century', 'Patronymic', 'One of the oldest Irish surnames, from Brian Boru'),
      ('Müller', 'German', 'Germany', 'Miller', '12th century', 'Occupational', 'Most common German surname, denoting a miller'),
      ('Johansson', 'Swedish', 'Sweden', 'Son of Johan', '15th century', 'Patronymic', 'Common Swedish patronymic surname'),
      ('Kelly', 'Irish Gaelic', 'Ireland', 'Bright-headed warrior', '9th century', 'Descriptive', 'From Ó Ceallaigh, one of most common Irish names'),
      ('Bergström', 'Swedish', 'Sweden', 'Mountain stream', '17th century', 'Nature', 'Ornamental Swedish surname combining berg + ström'),
      ('Weber', 'German', 'Germany', 'Weaver', '13th century', 'Occupational', 'Denoting a weaver of cloth'),
      ('Schmidt', 'German', 'Germany', 'Smith/Metalworker', '12th century', 'Occupational', 'Second most common German surname'),
      ('Chen', 'Chinese', 'China', 'Old/Ancient', '3000 years ago', 'State Name', 'From the ancient state of Chen'),
      ('Adams', 'English', 'England', 'Son of Adam', '12th century', 'Patronymic', 'From the Hebrew given name Adam'),
      ('Lindqvist', 'Swedish', 'Sweden', 'Linden branch', '18th century', 'Nature', 'Ornamental Swedish name from lind + qvist'),
      ('Johnson', 'English/Swedish', 'England/Sweden', 'Son of John', '14th century', 'Patronymic', 'One of most common English surnames'),
      ('Miller', 'English', 'England', 'One who grinds grain', '12th century', 'Occupational', 'English occupational surname'),
      ('O''Sullivan', 'Irish Gaelic', 'Ireland', 'Dark-eyed one', '10th century', 'Descriptive', 'Third most common Irish surname'),
      ('Eriksson', 'Swedish', 'Sweden', 'Son of Erik', '15th century', 'Patronymic', 'Very common Swedish patronymic')
    `);

    // Seed dna_matches (15 items)
    await client.query(`
      INSERT INTO dna_matches (match_name, shared_cm, shared_segments, chromosomes, predicted_relationship, confidence, match_date) VALUES
      ('Sarah Miller', 212.50, 14, '1, 3, 7, 11, 15', '2nd Cousin', 95.00, '2024-01-15'),
      ('John O''Brien', 78.30, 8, '2, 5, 9', '3rd Cousin', 85.00, '2024-02-20'),
      ('Emma Johansson', 145.00, 11, '1, 4, 8, 12', '2nd Cousin Once Removed', 90.00, '2024-03-10'),
      ('Michael Harrison', 850.00, 32, '1-22', '1st Cousin', 99.00, '2024-01-05'),
      ('Lisa Müller-Schmidt', 65.20, 6, '3, 10, 18', '3rd Cousin', 80.00, '2024-04-18'),
      ('David Chen', 35.00, 4, '6, 14', '4th Cousin', 60.00, '2024-05-22'),
      ('Karen Johnson', 110.00, 9, '2, 7, 11, 16', 'Half 2nd Cousin', 75.00, '2024-06-30'),
      ('Robert Harrison III', 425.00, 22, '1-15, 17, 19', '1st Cousin Once Removed', 98.00, '2024-02-14'),
      ('Patricia Kelly', 55.80, 5, '4, 9, 20', '3rd Cousin', 70.00, '2024-07-08'),
      ('Thomas Bergström', 28.50, 3, '8, 13', '4th Cousin', 55.00, '2024-08-15'),
      ('Jennifer Adams', 195.00, 13, '1, 3, 6, 10, 14', '2nd Cousin', 92.00, '2024-03-25'),
      ('William O''Brien Jr', 160.00, 12, '2, 5, 8, 11, 17', '2nd Cousin Once Removed', 88.00, '2024-09-01'),
      ('Anna Lindqvist', 18.50, 2, '15', '5th Cousin', 40.00, '2024-10-12'),
      ('Mark Harrison', 1750.00, 45, '1-22, X', 'Half Sibling', 99.50, '2024-01-02'),
      ('Sophie Weber', 42.00, 4, '7, 12, 21', '3rd Cousin Once Removed', 65.00, '2024-11-20')
    `);

    // Seed genealogy_documents (15 items)
    await client.query(`
      INSERT INTO genealogy_documents (document_type, title, document_date, location, person_name, content_summary, source) VALUES
      ('Birth Certificate', 'Birth of William J. Harrison', '1845-03-12', 'Liverpool, England', 'William James Harrison', 'Male child born to James and Mary Harrison at 14 Dock Street', 'Liverpool Parish Records'),
      ('Ship Manifest', 'SS Britannic Passenger List', '1870-05-20', 'Boston Harbor', 'William James Harrison', 'Passenger age 25, occupation: seaman, destination: Boston', 'National Archives'),
      ('Marriage Certificate', 'Harrison-O''Brien Marriage', '1872-09-15', 'Boston, Massachusetts', 'William Harrison & Margaret O''Brien', 'Married at St. Patrick''s Church by Father Michael Dunne', 'Boston City Hall'),
      ('Census Record', '1880 US Federal Census', '1880-06-01', 'Boston, Massachusetts', 'Harrison Family', 'William (35), Margaret (30), Thomas (8), Catherine (5)', 'US Census Bureau'),
      ('Death Certificate', 'Death of William J. Harrison', '1912-11-03', 'Boston, Massachusetts', 'William James Harrison', 'Cause: pneumonia, Age 67, Occupation: retired captain', 'Massachusetts Vital Records'),
      ('Immigration Record', 'Castle Garden Arrival', '1875-08-22', 'New York, New York', 'Friedrich Wilhelm Müller', 'German male, age 37, occupation: brewer, from Stuttgart', 'Castle Garden Records'),
      ('Military Record', 'WWII Service Record', '1942-1945', 'European Theater', 'Robert Charles Harrison', 'War correspondent, attached to 3rd Infantry Division', 'National Personnel Records'),
      ('Church Record', 'Baptism of Margaret O''Brien', '1850-04-02', 'County Cork, Ireland', 'Margaret Anne O''Brien', 'Baptized at St. Colman''s Cathedral, parents: Patrick and Bridget', 'Catholic Diocese of Cloyne'),
      ('Land Deed', 'Property Purchase - Milwaukee', '1876-03-10', 'Milwaukee, Wisconsin', 'Friedrich W. Müller', 'Purchased lot on 3rd Street for brewery establishment', 'Milwaukee County Records'),
      ('Naturalization Papers', 'US Naturalization', '1882-07-04', 'Boston, Massachusetts', 'William James Harrison', 'Granted US citizenship, renouncing British allegiance', 'US District Court'),
      ('University Record', 'Harvard Medical Graduation', '1898-06-15', 'Cambridge, Massachusetts', 'Thomas Edward Harrison', 'Doctor of Medicine degree conferred', 'Harvard University Archives'),
      ('Swedish Church Book', 'Husförhörslängd Entry', '1860-01-15', 'Gothenburg, Sweden', 'Ingrid Johansson', 'Household examination record showing birth and family', 'Swedish National Archives'),
      ('Probate Record', 'Will of Heinrich Müller', '1875-12-01', 'Stuttgart, Germany', 'Heinrich Müller', 'Estate divided among three sons including Friedrich', 'Württemberg State Archives'),
      ('Newspaper Article', 'Brewery Opening Announcement', '1876-10-15', 'Milwaukee, Wisconsin', 'Friedrich W. Müller', 'Müller''s Bavarian Brewery opens on Third Street', 'Milwaukee Sentinel'),
      ('Army Nurse Record', 'ANC Service File', '1943-1945', 'North Africa/Italy', 'Dorothy Mae Müller', 'First Lieutenant, Army Nurse Corps, 48th Surgical Hospital', 'National Archives')
    `);

    // Seed heritage_recipes (15 items)
    await client.query(`
      INSERT INTO heritage_recipes (recipe_name, origin_region, origin_country, cuisine_type, era, key_ingredients, description) VALUES
      ('Traditional Irish Soda Bread', 'County Cork', 'Ireland', 'Bread', '1830s-Present', 'Flour, buttermilk, baking soda, salt', 'Simple quick bread that sustained Irish families through hardship'),
      ('Bavarian Schweinshaxe', 'Bavaria', 'Germany', 'Main Course', '1700s-Present', 'Pork knuckle, beer, caraway seeds, garlic', 'Crispy roasted pork knuckle, a Bavarian classic'),
      ('Swedish Köttbullar', 'Gothenburg', 'Sweden', 'Main Course', '1700s-Present', 'Beef, pork, cream, breadcrumbs, allspice', 'Traditional Swedish meatballs with cream sauce'),
      ('English Shepherd''s Pie', 'Liverpool', 'England', 'Main Course', '1790s-Present', 'Lamb mince, potatoes, onions, gravy', 'Working-class English comfort food'),
      ('Irish Colcannon', 'County Cork', 'Ireland', 'Side Dish', '1700s-Present', 'Potatoes, cabbage, butter, milk, scallions', 'Traditional Irish mashed potato dish with greens'),
      ('German Sauerbraten', 'Stuttgart', 'Germany', 'Main Course', '1600s-Present', 'Beef, red wine vinegar, gingersnaps, onions', 'German pot roast marinated for days in vinegar'),
      ('Swedish Smörgåstårta', 'Gothenburg', 'Sweden', 'Appetizer', '1940s-Present', 'Bread, shrimp, cream cheese, salmon, eggs', 'Elaborate Swedish sandwich cake for celebrations'),
      ('English Fish and Chips', 'Liverpool', 'England', 'Main Course', '1860s-Present', 'White fish, potatoes, flour, malt vinegar', 'Iconic British comfort food from port cities'),
      ('Irish Boxty', 'Ireland', 'Ireland', 'Side Dish', '1700s-Present', 'Grated potato, flour, baking soda, buttermilk', 'Traditional Irish potato pancake'),
      ('German Brezel', 'Bavaria', 'Germany', 'Bread', '1200s-Present', 'Flour, butter, lye solution, salt', 'Traditional Bavarian soft pretzel'),
      ('Swedish Kanelbullar', 'Sweden', 'Sweden', 'Pastry', '1920s-Present', 'Flour, butter, cardamom, cinnamon, sugar', 'Swedish cinnamon buns celebrated on Oct 4th'),
      ('English Sticky Toffee Pudding', 'England', 'England', 'Dessert', '1970s-Present', 'Dates, brown sugar, butter, cream, treacle', 'Rich English dessert with toffee sauce'),
      ('Irish Stew', 'Ireland', 'Ireland', 'Main Course', '1800s-Present', 'Lamb, potatoes, onions, carrots, thyme', 'Quintessential one-pot Irish comfort meal'),
      ('German Apfelstrudel', 'Bavaria', 'Germany', 'Dessert', '1600s-Present', 'Apples, raisins, cinnamon, phyllo dough, butter', 'Classic layered apple pastry'),
      ('Swedish Gravlax', 'Scandinavia', 'Sweden', 'Appetizer', '1300s-Present', 'Salmon, dill, sugar, salt, white pepper', 'Cured salmon originally buried in sand')
    `);

    // Seed heritage_reports (15 items)
    await client.query(`
      INSERT INTO heritage_reports (report_type, subject_name, summary, key_findings, regions, time_span, status) VALUES
      ('Full Heritage Analysis', 'Harrison Family', 'Comprehensive analysis of Harrison family heritage spanning 5 generations', 'Strong British-Irish roots with German and Scandinavian admixture', 'British Isles, Germany, Scandinavia', '1810-Present', 'completed'),
      ('DNA Ethnicity Report', 'Personal DNA', 'Detailed breakdown of ethnic composition from DNA testing', '32.5% Northwestern European dominant with diverse European mix', 'Europe, Africa, Asia', 'Ancient-Present', 'completed'),
      ('Migration Analysis', 'Harrison-O''Brien Lines', 'Tracking family migration patterns across centuries', 'Three major transatlantic migrations between 1850-1900', 'Ireland, England, USA', '1850-1900', 'completed'),
      ('Health Genetics Summary', 'Personal Health', 'Overview of genetic health predispositions', '15 variants analyzed, 3 moderate risk factors identified', 'N/A', 'Current', 'completed'),
      ('Paternal Line Report', 'Harrison Y-DNA', 'Deep analysis of paternal haplogroup and lineage', 'R1b-M269 haplogroup traces to Western European origins', 'Western Europe', '6000 BCE-Present', 'completed'),
      ('Maternal Line Report', 'O''Brien mtDNA', 'Deep analysis of maternal haplogroup and lineage', 'H1 haplogroup with Franco-Cantabrian Ice Age origins', 'Western Europe', '15000 BCE-Present', 'completed'),
      ('Surname Study', 'Harrison & O''Brien', 'Etymology and history of primary family surnames', 'Both surnames have deep historical roots with notable bearers', 'England, Ireland', '900 CE-Present', 'completed'),
      ('Cultural Heritage Summary', 'Multi-Heritage', 'Exploration of cultural traditions from all ancestral lines', 'Rich blend of English, Irish, German, and Swedish traditions', 'British Isles, Germany, Sweden', '500 CE-Present', 'completed'),
      ('DNA Match Report', 'All Matches Q1 2024', 'Summary of DNA matches found in first quarter', '15 significant matches found, 2 unexpected connections', 'USA, Europe', 'Current', 'completed'),
      ('Ancient Ancestry Report', 'Deep Origins', 'Connections to ancient populations through DNA', 'Significant affinity with Western Hunter-Gatherers and Yamnaya', 'Europe, Near East', '50000 BCE-3000 BCE', 'completed'),
      ('Document Analysis', 'Immigration Papers', 'Analysis of collected immigration and ship records', '6 immigration events documented with ship manifests', 'Transatlantic', '1870-1892', 'completed'),
      ('Genetic Traits Summary', 'Personal Traits', 'Overview of genetic trait predictions from DNA', '15 traits analyzed with varying confidence levels', 'N/A', 'Current', 'completed'),
      ('Family Relationship Map', 'Extended Family', 'Mapping of all identified family relationships', '15 DNA-confirmed relationships mapped across 5 generations', 'USA, Europe', '1820-Present', 'completed'),
      ('Timeline Compilation', 'All Ancestors', 'Chronological compilation of ancestor life events', '15 major life events documented from 1810-1970', 'USA, Europe', '1810-1970', 'completed'),
      ('Heritage Recipe Collection', 'Family Recipes', 'Compilation of traditional recipes from ancestral regions', '15 traditional recipes spanning 4 cultural traditions', 'Ireland, England, Germany, Sweden', '1200-Present', 'completed')
    `);

    // Seed ancient_ancestry (15 items)
    await client.query(`
      INSERT INTO ancient_ancestry (population_name, region, time_period, affinity_percentage, description, archaeological_sites) VALUES
      ('Western Hunter-Gatherers', 'Western Europe', '15000-5000 BCE', 28.50, 'Mesolithic hunter-gatherers who inhabited Western Europe after the Ice Age', 'Loschbour, Luxembourg; La Braña, Spain'),
      ('Yamnaya Pastoralists', 'Pontic-Caspian Steppe', '3300-2600 BCE', 22.00, 'Bronze Age pastoralists who massively migrated into Europe', 'Samara, Russia; Kalmykia region'),
      ('Neolithic Anatolian Farmers', 'Anatolia/Turkey', '8000-4000 BCE', 18.50, 'First farmers who brought agriculture to Europe', 'Çatalhöyük, Turkey; Barcın Höyük'),
      ('Bell Beaker Culture', 'Western Europe', '2800-1800 BCE', 12.00, 'Bronze Age culture known for distinctive pottery', 'Stonehenge area; Iberian Peninsula'),
      ('Corded Ware Culture', 'Central/Northern Europe', '2900-2350 BCE', 8.50, 'Late Neolithic culture related to Indo-European expansion', 'Eulau, Germany; Baltic region'),
      ('Viking Norse', 'Scandinavia', '793-1066 CE', 6.20, 'Medieval Scandinavian seafarers and traders', 'Birka, Sweden; Hedeby, Denmark'),
      ('Anglo-Saxons', 'England', '400-1066 CE', 5.80, 'Germanic settlers who migrated to Britain', 'Sutton Hoo; West Stow, Suffolk'),
      ('Iron Age Celts', 'British Isles', '800 BCE-400 CE', 4.50, 'Celtic-speaking peoples of the British Isles', 'Maiden Castle; Danebury hillfort'),
      ('Roman Britons', 'Britain', '43-410 CE', 3.20, 'Mixed population during Roman occupation of Britain', 'Bath; Hadrian''s Wall'),
      ('Eastern Hunter-Gatherers', 'Eastern Europe/Russia', '10000-4000 BCE', 2.80, 'Mesolithic populations of the Eastern European plain', 'Karelia, Russia; Yuzhnyy Oleni'),
      ('Scandinavian Hunter-Gatherers', 'Scandinavia', '8000-4000 BCE', 2.50, 'Post-Ice Age inhabitants of Scandinavia', 'Motala, Sweden; Huseby Klev'),
      ('Neolithic British', 'British Isles', '4000-2500 BCE', 2.00, 'Early farming communities of Britain', 'Windmill Hill; Skara Brae, Orkney'),
      ('Copper Age Europeans', 'Central Europe', '3500-2300 BCE', 1.50, 'Transitional populations between Neolithic and Bronze Age', 'Ötzi site, Alps; Vučedol, Croatia'),
      ('Medieval Irish', 'Ireland', '400-1500 CE', 1.20, 'Early medieval Irish populations', 'Clonmacnoise; Rock of Cashel'),
      ('Mesolithic Scandinavians', 'Sweden/Norway', '9000-4000 BCE', 0.80, 'Early post-glacial inhabitants of Scandinavia', 'Stora Förvar, Gotland; Alta, Norway')
    `);

    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Seed error:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
