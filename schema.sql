CREATE TABLE users(
	user_id int(11) NOT NULL AUTO_INCREMENT,
	user_name VARCHAR(256) NOT NULL,
	user_age int(11) NOT NULL,
	user_gender VARCHAR(256) NOT NULL,
	user_password VARCHAR(256) NOT NULL,
	PRIMARY KEY (user_id)
) ENGINE=INNODB;

CREATE TABLE images(
	image_id int(11) NOT NULL AUTO_INCREMENT,
	image_path VARCHAR(256) NOT NULL,
	image_name VARCHAR(256) NOT NULL,
	PRIMARY KEY (image_id)
) ENGINE=INNODB;

CREATE TABLE user_upload(
	file_id int(11) NOT NULL AUTO_INCREMENT,
	file_name VARCHAR(256) NOT NULL,
	file_path VARCHAR(256) NOT NULL,
	user_id int(11) NOT NULL,
	PRIMARY KEY (file_id),
    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
) ENGINE=INNODB;