package sg.edu.nus.iss.project.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import jakarta.json.Json;

@Service
public class StockService {

	@Value("${rapid.api.key}")
	private String rapidApiKey;

	private static final String TWELVE_DATA_SEARCH_ENDPOINT = "https://twelve-data1.p.rapidapi.com/symbol_search";
	private static final String TWELVE_DATA_PRICE_ENDPOINT = "https://twelve-data1.p.rapidapi.com/price";
	private static final String TWELVE_DATA_LOGO_ENDPOINT = "https://twelve-data1.p.rapidapi.com/logo";
	private static final String MBOUM_FINANCE_COMPONAY_PROFILE_ENDPOINT = "https://mboum-finance.p.rapidapi.com/qu/quote/asset-profile";
	private static final String REAL_STONKS_PRICE_ENDPOINT = "https://realstonks.p.rapidapi.com";
	private static final String YH_FINANCE_API = "https://yh-finance-complete.p.rapidapi.com/yhfhistorical";

	public ResponseEntity<String> getStockDataTwelveData(String symbol, int outputsize) {
		String url = UriComponentsBuilder.fromUriString(TWELVE_DATA_SEARCH_ENDPOINT)
				.queryParam("symbol", symbol)
				.queryParam("outputsize", outputsize)
				.toUriString();

		RequestEntity req = RequestEntity.get(url)
				.header("X-RapidAPI-Key", rapidApiKey)
				.header("X-RapidAPI-Host", "twelve-data1.p.rapidapi.com")
				.build();

		RestTemplate template = new RestTemplate();

		ResponseEntity<String> resp = null;

		try {
			resp = template.exchange(req, String.class);
		} catch (RestClientException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.contentType(MediaType.APPLICATION_JSON)
					.body(Json.createObjectBuilder()
							.add("message", e.getMessage())
							.build().toString());
		}

		return ResponseEntity.status(HttpStatus.OK)
				.contentType(MediaType.APPLICATION_JSON)
				.body(resp.getBody());
	}

	public ResponseEntity<String> getStockPrice(String symbol, int outputsize) {

		String url = UriComponentsBuilder.fromUriString(TWELVE_DATA_PRICE_ENDPOINT)
				.queryParam("symbol", symbol)
				.queryParam("outputsize", outputsize)
				.toUriString();

		RequestEntity req = RequestEntity.get(url)
				.header("X-RapidAPI-Key", rapidApiKey)
				.header("X-RapidAPI-Host", "twelve-data1.p.rapidapi.com")
				.build();

		RestTemplate template = new RestTemplate();

		ResponseEntity<String> resp = null;

		try {
			resp = template.exchange(req, String.class);
		} catch (RestClientException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.contentType(MediaType.APPLICATION_JSON)
					.body(Json.createObjectBuilder()
							.add("message", e.getMessage())
							.build().toString());
		}

		return ResponseEntity.status(HttpStatus.OK)
				.contentType(MediaType.APPLICATION_JSON)
				.body(resp.getBody());
	}

	public ResponseEntity<String> getStockLogo(String symbol) {

		String url = UriComponentsBuilder.fromUriString(TWELVE_DATA_LOGO_ENDPOINT)
				.queryParam("symbol", symbol)
				.toUriString();

		RequestEntity req = RequestEntity.get(url)
				.header("X-RapidAPI-Key", rapidApiKey)
				.header("X-RapidAPI-Host", "twelve-data1.p.rapidapi.com")
				.build();

		RestTemplate template = new RestTemplate();

		ResponseEntity<String> resp = null;

		try {
			resp = template.exchange(req, String.class);
		} catch (RestClientException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.contentType(MediaType.APPLICATION_JSON)
					.body(Json.createObjectBuilder()
							.add("message", e.getMessage())
							.build().toString());
		}

		return ResponseEntity.status(HttpStatus.OK)
				.contentType(MediaType.APPLICATION_JSON)
				.body(resp.getBody());
	}

	public ResponseEntity<String> getRealStonksPrice(String symbol) {
		String combined = REAL_STONKS_PRICE_ENDPOINT + "/" + symbol;
		String url = UriComponentsBuilder.fromUriString(combined)
				.toUriString();

		RequestEntity req = RequestEntity.get(url)
				.header("X-RapidAPI-Key", rapidApiKey)
				.header("X-RapidAPI-Host", "realstonks.p.rapidapi.com")
				.build();

		RestTemplate template = new RestTemplate();

		ResponseEntity<String> resp = null;

		try {
			resp = template.exchange(req, String.class);
		} catch (RestClientException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.contentType(MediaType.APPLICATION_JSON)
					.body(Json.createObjectBuilder()
							.add("message", e.getMessage())
							.build().toString());
		}

		return ResponseEntity.status(HttpStatus.OK)
				.contentType(MediaType.APPLICATION_JSON)
				.body(resp.getBody());
	}

	public ResponseEntity<String> getStockMonthlyPrice(String symbol, String sdate, String edate) {
		// System.out.println(
		// "Calling YH FINANCE API for %s monthly price from %s to %s from
		// StockService".formatted(symbol, sdate,
		// edate));
		String url = UriComponentsBuilder.fromUriString(YH_FINANCE_API)
				.queryParam("ticker", symbol)
				.queryParam("sdate", sdate)
				.queryParam("edate", edate)
				.toUriString();

		RequestEntity req = RequestEntity.get(url)
				.header("X-RapidAPI-Key", rapidApiKey)
				.header("X-RapidAPI-Host", "yh-finance-complete.p.rapidapi.com")
				.build();

		RestTemplate template = new RestTemplate();

		ResponseEntity<String> resp = null;

		try {
			resp = template.exchange(req, String.class);
		} catch (RestClientException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.contentType(MediaType.APPLICATION_JSON)
					.body(Json.createObjectBuilder()
							.add("message", e.getMessage())
							.build().toString());
		}

		return ResponseEntity.status(HttpStatus.OK)
				.contentType(MediaType.APPLICATION_JSON)
				.body(resp.getBody());
	}

	public ResponseEntity<String> getStockProfile(String symbol) {
		String url = UriComponentsBuilder.fromUriString(MBOUM_FINANCE_COMPONAY_PROFILE_ENDPOINT)
				.queryParam("symbol", symbol)
				.toUriString();

		RequestEntity req = RequestEntity.get(url)
				.header("X-RapidAPI-Key", rapidApiKey)
				.header("X-RapidAPI-Host", "mboum-finance.p.rapidapi.com")
				.build();

		RestTemplate template = new RestTemplate();

		ResponseEntity<String> resp = null;

		try {
			resp = template.exchange(req, String.class);
		} catch (RestClientException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.contentType(MediaType.APPLICATION_JSON)
					.body(Json.createObjectBuilder()
							.add("message", e.getMessage())
							.build().toString());
		}

		return ResponseEntity.status(HttpStatus.OK)
				.contentType(MediaType.APPLICATION_JSON)
				.body(resp.getBody());
	}

}
