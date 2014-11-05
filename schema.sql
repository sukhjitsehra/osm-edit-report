CREATE TABLE osm_user (
  id_user INTEGER PRIMARY KEY AUTOINCREMENT,
  osm_user TEXT,
  color TEXT
);


CREATE TABLE osm_highway (	
  osm_file TEXT,
  id_user INTEGER,
  osm_date TEXT,
  high_v1 INTEGER,
  high_vx  INTEGER
);


