
--DROP TABLE osm_node;
--DROP TABLE osm_way;
--DROP TABLE osm_relation;
--DROP TABLE osm_user
--DROP TABLE osm_date;

CREATE TABLE osm_user(
  iduser INTEGER NOT NULL  PRIMARY KEY,
  osmuser character(100),
  color character(7),
  estado boolean not null
);


CREATE TABLE osm_date(
  idfile character(10) NOT NULL  PRIMARY KEY ,
  osmdate INTEGER
);

-- node
CREATE TABLE osm_node(
 iduser INTEGER ,
 idfile character(10) ,
 node_v1 INTEGER,
 node_vx INTEGER
);

alter table osm_node
add constraint fk_iduser_osm_node
Foreign key (iduser)
references osm_user(iduser);

alter table osm_node
add constraint fk_idfile_osm_node
Foreign key (idfile)
references osm_date(idfile);


--way
CREATE TABLE osm_way(
 iduser INTEGER ,
 idfile character(10) ,
 way_v1 INTEGER,
 way_vx INTEGER
);


alter table osm_way
add constraint fk_iduser_osm_way
Foreign key (iduser)
references osm_user(iduser);

alter table osm_way
add constraint fk_idfile_osm_way
Foreign key (idfile)
references osm_date(idfile);


--relation

CREATE TABLE osm_relation(
 iduser INTEGER ,
 idfile character(10) ,
 relation_v1 INTEGER,
 relation_vx INTEGER
);

alter table osm_relation
add constraint fk_iduser_osm_relation
Foreign key (iduser)
references osm_user(iduser);

alter table osm_relation
add constraint fk_idfile_osm_relation
Foreign key (idfile)
references osm_date(idfile);



INSERT INTO osm_user( iduser, osmuser, color, estado)  VALUES (510836,'Rub21','0171C5',true);
INSERT INTO osm_user( iduser, osmuser, color, estado)  VALUES (1240849,'ediyes','FFFF00',true);
INSERT INTO osm_user( iduser, osmuser, color, estado)  VALUES (1829683,'Luis36995','00FF00',true);
INSERT INTO osm_user( iduser, osmuser, color, estado)  VALUES (2219338,'RichRico','EE3344',true);
INSERT INTO osm_user( iduser, osmuser, color, estado)  VALUES (2226712,'dannykath','662289',true);
INSERT INTO osm_user( iduser, osmuser, color, estado)  VALUES (94578,'andygol','3E8380',true);



SELECT iduser, osmuser, color, estado FROM osm_user;




CREATE OR REPLACE FUNCTION insertobjs(idfile varchar(10),
					  iduser integer,
					  node_v1 integer,
					  node_vx integer,
					  way_v1 integer,
					  way_vx integer,
					  relation_v1 integer,
					  relation_vx integer)
RETURNS VOID
AS $$
DECLARE        
BEGIN
	INSERT INTO osm_node(iduser, idfile, node_v1, node_vx) VALUES (iduser, idfile, node_v1, node_vx);
	INSERT INTO osm_way(iduser, idfile, way_v1, way_vx) VALUES (iduser, idfile, way_v1, way_vx);
	INSERT INTO osm_relation(iduser, idfile, relation_v1, relation_vx) VALUES (iduser, idfile, relation_v1, relation_vx);
END;
$$ LANGUAGE plpgsql;



--selecion

SELECT idfile, osmdate FROM osm_date;



SELECT u.osmuser, substring(to_timestamp(d.osmdate)::text,0,14) , (w.way_v1 + w.way_vx) as way FROM osm_way as w INNER JOIN osm_user as u on   u.iduser =  w.iduser INNER JOIN osm_date as d on   d.idfile =  w.idfile


--quiero por hora de 16 0 horas =1415750400 y 17 0 horas =1416182400

SELECT u.osmuser, substring(to_timestamp(d.osmdate)::text,0,14), (w.way_v1 + w.way_vx) as way 
FROM osm_way as w 
INNER JOIN osm_user as u on   u.iduser =  w.iduser 
INNER JOIN osm_date as d on   d.idfile =  w.idfile
WHERE d.osmdate> 1416096000 AND d.osmdate<1416182400 

-- Todo los avances por team

SELECT u.osmuser,sum(w.way_v1 + w.way_vx) as way 
FROM osm_way as w 
INNER JOIN osm_user as u on   u.iduser =  w.iduser 
INNER JOIN osm_date as d on   d.idfile =  w.idfile
WHERE  d.osmdate> 0 AND d.osmdate<1516268800   GROUP BY  u.osmuser


--POR DIA

SELECT  u.osmuser, substring(to_timestamp(d.osmdate)::text,0,11) as date, sum(w.way_v1 + w.way_vx) as way 
FROM osm_way as w 
INNER JOIN osm_user as u on   u.iduser =  w.iduser 
INNER JOIN osm_date as d on   d.idfile =  w.idfile 
WHERE d.osmdate> 1416096000 AND d.osmdate<1416182400
GROUP BY  date,u.osmuser 
ORDER BY u.osmuser 





