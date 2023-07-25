package sg.edu.nus.iss.project.services;

import java.time.LocalDate;
import java.util.LinkedList;
import java.util.List;

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
import sg.edu.nus.iss.project.models.Stock;
import sg.edu.nus.iss.project.models.StockPrice;

@Service
public class StockService {

	@Value("${rapid.api.key}")
	private String rapidApiKey;

	private static final String TWELVE_DATA_SEARCH_ENDPOINT = "https://twelve-data1.p.rapidapi.com/symbol_search";
	private static final String TWELVE_DATA_PRICE_ENDPOINT = "https://twelve-data1.p.rapidapi.com/price";
	private static final String TWELVE_DATA_LOGO_ENDPOINT = "https://twelve-data1.p.rapidapi.com/logo";
	private static final String MBOUM_FINANCE_COMPONAY_PROFILE_ENDPOINT = "https://mboum-finance.p.rapidapi.com/qu/quote/asset-profile";
	private static final String REAL_STONKS_PRICE_ENDPOINT = "https://realstonks.p.rapidapi.com";
	private static final String YH_FINANCE_HISTORICAL_DATA_API = "https://yh-finance-complete.p.rapidapi.com/yhfhistorical";
	private static final String YH_FINANCE_STOCK_SUMMARY_API = "https://yh-finance-complete.p.rapidapi.com/summaryprofile";
	private static final String YH_FINANCE_STOCK_PRICE_API = "https://yh-finance-complete.p.rapidapi.com/yhprice";

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
		String url = UriComponentsBuilder.fromUriString(YH_FINANCE_HISTORICAL_DATA_API)
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

	public ResponseEntity<String> getStockSimpleSummaryYHFinance(String symbol) {
		String url = UriComponentsBuilder.fromUriString(YH_FINANCE_STOCK_SUMMARY_API)
				.queryParam("symbol", symbol)
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

	public ResponseEntity<String> getStockPriceYHFinance(String symbol) {
		String url = UriComponentsBuilder.fromUriString(YH_FINANCE_STOCK_PRICE_API)
				.queryParam("ticker", symbol)
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

	public double getStockYearFirstClosePrice(List<StockPrice> stockPrices) {
		List<StockPrice> janStocks = new LinkedList<>();
		stockPrices.forEach(sp -> sp.setLocalDate(LocalDate.parse(sp.getDate())));
		for (StockPrice sp : stockPrices) {
			int month = sp.getLocalDate().getMonthValue();
			if (month == 1) {
				janStocks.add(sp);
			}
		}

		int largestDate = 31;
		StockPrice latestStockPriceForTheMonth = null;
		for (StockPrice sPrice : janStocks) {
			int stockDate = sPrice.getLocalDate().getDayOfMonth();
			if (stockDate < largestDate) {
				largestDate = stockDate;
				latestStockPriceForTheMonth = sPrice;
			}
		}
		if (latestStockPriceForTheMonth != null) {
			return latestStockPriceForTheMonth.getClosePrice();
		} else {
			return 0.0;
		}

	}

	public List<Double> getStockMonthlyClosePrice(List<StockPrice> stockPrices) {
		List<StockPrice> janStocks = new LinkedList<>();
		List<StockPrice> febStocks = new LinkedList<>();
		List<StockPrice> marStocks = new LinkedList<>();
		List<StockPrice> aprStocks = new LinkedList<>();
		List<StockPrice> mayStocks = new LinkedList<>();
		List<StockPrice> juneStocks = new LinkedList<>();
		List<StockPrice> julyStocks = new LinkedList<>();
		List<StockPrice> augStocks = new LinkedList<>();
		List<StockPrice> sepStocks = new LinkedList<>();
		List<StockPrice> octStocks = new LinkedList<>();
		List<StockPrice> novStocks = new LinkedList<>();
		List<StockPrice> decStocks = new LinkedList<>();

		List<List<StockPrice>> allStocksList = new LinkedList<>();
		allStocksList.add(janStocks);
		allStocksList.add(febStocks);
		allStocksList.add(marStocks);
		allStocksList.add(aprStocks);
		allStocksList.add(mayStocks);
		allStocksList.add(juneStocks);
		allStocksList.add(julyStocks);
		allStocksList.add(augStocks);
		allStocksList.add(sepStocks);
		allStocksList.add(octStocks);
		allStocksList.add(novStocks);
		allStocksList.add(decStocks);

		// set local date for each stock price
		stockPrices.forEach(sp -> sp.setLocalDate(LocalDate.parse(sp.getDate())));

		// separate them into their own month
		for (StockPrice sp : stockPrices) {
			int month = sp.getLocalDate().getMonthValue();

			switch (month) {
				case 1:
					janStocks.add(sp);
					break;
				case 2:
					febStocks.add(sp);
					break;
				case 3:
					marStocks.add(sp);
					break;
				case 4:
					aprStocks.add(sp);
					break;
				case 5:
					mayStocks.add(sp);
					break;
				case 6:
					juneStocks.add(sp);
					break;
				case 7:
					julyStocks.add(sp);
					break;
				case 8:
					augStocks.add(sp);
					break;
				case 9:
					sepStocks.add(sp);
					break;
				case 10:
					octStocks.add(sp);
					break;
				case 11:
					novStocks.add(sp);
					break;
				case 12:
					decStocks.add(sp);
					break;
			}
		}

		List<Double> stockMonthlyClosePrice = new LinkedList<>();

		// for each month, find the largest date to get the price
		for (List<StockPrice> spList : allStocksList) {
			int latestDate = 1;
			StockPrice latestStockPriceForTheMonth = null;
			for (StockPrice sPrice : spList) {
				int stockDate = sPrice.getLocalDate().getDayOfMonth();
				if (stockDate > latestDate) {
					latestDate = stockDate;
					latestStockPriceForTheMonth = sPrice;
				}
			}
			if (latestStockPriceForTheMonth != null) {
				stockMonthlyClosePrice.add(latestStockPriceForTheMonth.getClosePrice());
			} else {
				stockMonthlyClosePrice.add(0.0);
			}
		}

		return stockMonthlyClosePrice;
	}

}
