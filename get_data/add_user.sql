INSERT INTO osm_user( iduser, osmuser, color, estado) VALUES (510836,'Rub21','0171C5',true);
INSERT INTO osm_user( iduser, osmuser, color, estado) VALUES (1240849,'ediyes','FFFF00',true);
INSERT INTO osm_user( iduser, osmuser, color, estado) VALUES (1829683,'Luis36995','00FF00',true);
INSERT INTO osm_user( iduser, osmuser, color, estado) VALUES (2219338,'RichRico','EE3344',true);
INSERT INTO osm_user( iduser, osmuser, color, estado) VALUES (2226712,'dannykath','662289',true);
INSERT INTO osm_user( iduser, osmuser, color, estado) VALUES (94578,'andygol','3E8380',true);
INSERT INTO osm_user( iduser, osmuser, color, estado) VALUES (1051550,'shravan91','FF8A00',true);
INSERT INTO osm_user( iduser, osmuser, color, estado) VALUES (2554698,'Ruth Maben','FA58F4',true);
INSERT INTO osm_user( iduser, osmuser, color, estado) VALUES (2377377,'abel801','008000',true);
INSERT INTO osm_user( iduser, osmuser, color, estado) VALUES (2511706,'cesar28','800000',true);
INSERT INTO osm_user( iduser, osmuser, color, estado) VALUES (2512300,'samely','66CCCC',true);
INSERT INTO osm_user( iduser, osmuser, color, estado) VALUES (2115749,'srividya_c','F8981D',true);

UPDATE osm_user
   SET  color='7B68EE'
 WHERE iduser=2115749;

SELECT iduser, osmuser, color, estado FROM osm_user;
