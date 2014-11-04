INSERT   INTO  osm_user(osm_user)  VALUES ("Rub21");
INSERT   INTO  osm_user(osm_user)  VALUES ("ediyes");
INSERT   INTO  osm_user(osm_user)  VALUES ("Luis36995");
INSERT   INTO  osm_user(osm_user)  VALUES ("RichRico");
INSERT   INTO  osm_user(osm_user)  VALUES ("dannykath");
select * from osm_user;

//Select 
SELECT id_user,substr(osm_date,0,11) as date , substr(osm_date,12) as hour ,(high_vx+high_v1) as high_total from osm_highway

SELECT id_user,substr(osm_date,0,11) as date , substr(osm_date,12) as hour ,(high_vx+high_v1) as high_total from osm_highway WHERE date='2014-10-05'
