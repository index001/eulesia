-- Institution Topics Architecture
-- Adds source_institution_id to threads, creates institution_topics and tag_categories tables

-- 1. Add source_institution_id to threads (links bot-imported threads to source institution)
ALTER TABLE threads ADD COLUMN source_institution_id uuid REFERENCES users(id);
CREATE INDEX IF NOT EXISTS threads_source_institution_idx ON threads(source_institution_id);

-- 2. Create institution_topics table (links institution to its discussion topic)
CREATE TABLE IF NOT EXISTS institution_topics (
  institution_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  topic_tag varchar(100) NOT NULL,
  related_tags varchar(100)[] DEFAULT '{}',
  description text
);
CREATE INDEX IF NOT EXISTS institution_topics_topic_tag_idx ON institution_topics(topic_tag);

-- 3. Create tag_categories table (optional metadata for tags)
CREATE TABLE IF NOT EXISTS tag_categories (
  tag varchar(100) PRIMARY KEY,
  category varchar(100) NOT NULL,
  display_name varchar(255),
  description text,
  scope scope DEFAULT NULL,
  sort_order integer DEFAULT 0
);
CREATE INDEX IF NOT EXISTS tag_categories_category_idx ON tag_categories(category);
CREATE INDEX IF NOT EXISTS tag_categories_sort_idx ON tag_categories(category, sort_order);

-- 4. Seed curated civic tags
INSERT INTO tag_categories (tag, category, display_name, description, scope, sort_order) VALUES
  -- Talous & verotus
  ('talous', 'talous', 'Talous', 'Talous- ja finanssipolitiikka', 'national', 0),
  ('budjetti', 'talous', 'Budjetti', 'Valtion ja kuntien budjetit', 'national', 1),
  ('verotus', 'talous', 'Verotus', 'Veropolitiikka ja verouudistukset', 'national', 2),
  ('julkinen-talous', 'talous', 'Julkinen talous', 'Julkisen sektorin talous', 'national', 3),
  ('inflaatio', 'talous', 'Inflaatio', 'Hintojen nousu ja rahapolitiikka', NULL, 4),

  -- Terveys & hyvinvointi
  ('terveys', 'terveys', 'Terveys', 'Terveydenhuolto ja terveyspalvelut', NULL, 0),
  ('sote', 'terveys', 'Sote', 'Sosiaali- ja terveyspalvelut', 'national', 1),
  ('mielenterveys', 'terveys', 'Mielenterveys', 'Mielenterveyspalvelut ja -politiikka', NULL, 2),
  ('ikääntyminen', 'terveys', 'Ikääntyminen', 'Vanhusten hoiva ja palvelut', NULL, 3),
  ('hyvinvointi', 'terveys', 'Hyvinvointi', 'Kansalaisten hyvinvointi', NULL, 4),

  -- Koulutus & tiede
  ('koulutus', 'koulutus', 'Koulutus', 'Koulutuspolitiikka', NULL, 0),
  ('peruskoulu', 'koulutus', 'Peruskoulu', 'Peruskoulutus', 'local', 1),
  ('lukio', 'koulutus', 'Lukio', 'Lukiokoulutus', NULL, 2),
  ('ammatillinen-koulutus', 'koulutus', 'Ammatillinen koulutus', 'Ammatillinen koulutus ja oppisopimus', NULL, 3),
  ('yliopisto', 'koulutus', 'Yliopisto', 'Yliopistot ja korkeakoulut', 'national', 4),
  ('tutkimus', 'koulutus', 'Tutkimus', 'Tiede ja tutkimusrahoitus', 'national', 5),

  -- Ympäristö & ilmasto
  ('ympäristö', 'ympäristö', 'Ympäristö', 'Ympäristönsuojelu', NULL, 0),
  ('ilmasto', 'ympäristö', 'Ilmasto', 'Ilmastopolitiikka ja päästöt', NULL, 1),
  ('energia', 'ympäristö', 'Energia', 'Energiapolitiikka', 'national', 2),
  ('luonto', 'ympäristö', 'Luonto', 'Luonnonsuojelu ja biodiversiteetti', NULL, 3),
  ('kiertotalous', 'ympäristö', 'Kiertotalous', 'Kiertotalous ja jätehuolto', NULL, 4),

  -- Liikenne & infra
  ('liikenne', 'liikenne', 'Liikenne', 'Liikennepolitiikka', NULL, 0),
  ('joukkoliikenne', 'liikenne', 'Joukkoliikenne', 'Julkinen liikenne', 'local', 1),
  ('rautatiet', 'liikenne', 'Rautatiet', 'Junaliikenne ja radat', 'national', 2),
  ('tiet', 'liikenne', 'Tiet', 'Tieverkko ja tienpito', NULL, 3),
  ('pyöräily', 'liikenne', 'Pyöräily', 'Pyöräily-infrastruktuuri', 'local', 4),
  ('asuminen', 'liikenne', 'Asuminen', 'Asuntopolitiikka ja rakentaminen', NULL, 5),

  -- Turvallisuus & oikeus
  ('turvallisuus', 'turvallisuus', 'Turvallisuus', 'Sisäinen turvallisuus', 'national', 0),
  ('puolustus', 'turvallisuus', 'Puolustus', 'Maanpuolustus ja NATO', 'national', 1),
  ('oikeus', 'turvallisuus', 'Oikeus', 'Oikeusjärjestelmä ja lainsäädäntö', 'national', 2),
  ('poliisi', 'turvallisuus', 'Poliisi', 'Poliisitoiminta', NULL, 3),
  ('pelastustoimi', 'turvallisuus', 'Pelastustoimi', 'Pelastuspalvelut', 'local', 4),

  -- Työ & elinkeinot
  ('työ', 'työ', 'Työ', 'Työpolitiikka ja työelämä', NULL, 0),
  ('työllisyys', 'työ', 'Työllisyys', 'Työllisyys ja työnvälitys', 'national', 1),
  ('yrittäjyys', 'työ', 'Yrittäjyys', 'Yrittäjyys ja pk-yritykset', NULL, 2),
  ('teknologia', 'työ', 'Teknologia', 'Teknologiapolitiikka ja digitalisaatio', NULL, 3),
  ('maatalous', 'työ', 'Maatalous', 'Maatalous- ja elintarvikepolitiikka', NULL, 4),

  -- Kulttuuri & yhteiskunta
  ('kulttuuri', 'kulttuuri', 'Kulttuuri', 'Kulttuuripolitiikka', NULL, 0),
  ('media', 'kulttuuri', 'Media', 'Media ja viestintä', NULL, 1),
  ('urheilu', 'kulttuuri', 'Urheilu', 'Liikunta ja urheilu', NULL, 2),
  ('kielipolitiikka', 'kulttuuri', 'Kielipolitiikka', 'Kielivähemmistöt ja kielioikeudet', 'national', 3),
  ('maahanmuutto', 'kulttuuri', 'Maahanmuutto', 'Maahanmuutto ja kotoutuminen', 'national', 4),

  -- EU & kansainvälinen
  ('eu', 'eu', 'EU', 'Euroopan unioni', 'european', 0),
  ('eu-lainsäädäntö', 'eu', 'EU-lainsäädäntö', 'EU-direktiivit ja asetukset', 'european', 1),
  ('kauppapolitiikka', 'eu', 'Kauppapolitiikka', 'Kansainvälinen kauppa', 'european', 2),
  ('ihmisoikeudet', 'eu', 'Ihmisoikeudet', 'Ihmisoikeudet ja perusoikeudet', NULL, 3),
  ('ulkopolitiikka', 'eu', 'Ulkopolitiikka', 'Suomen ulkopolitiikka', 'national', 4),

  -- Kuntapolitiikka
  ('kaavoitus', 'kunta', 'Kaavoitus', 'Maankäyttö ja kaavoitus', 'local', 0),
  ('kunnanvaltuusto', 'kunta', 'Kunnanvaltuusto', 'Kunnallinen päätöksenteko', 'local', 1),
  ('palvelut', 'kunta', 'Palvelut', 'Kuntapalvelut', 'local', 2),
  ('varhaiskasvatus', 'kunta', 'Varhaiskasvatus', 'Päivähoito ja esiopetus', 'local', 3),
  ('kirjasto', 'kunta', 'Kirjasto', 'Kirjastopalvelut', 'local', 4)
ON CONFLICT (tag) DO NOTHING;
