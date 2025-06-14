package com.fidanlik.fysserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// @EnableMongoRepositories annotasyonuna artık gerek yok, Spring Boot bunu genelde kendi anlar.
// Sade bir başlangıç yapalım.
@SpringBootApplication
public class FysServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(FysServerApplication.class, args);
	}

}