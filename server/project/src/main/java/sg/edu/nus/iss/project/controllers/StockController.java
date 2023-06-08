package sg.edu.nus.iss.project.controllers;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.json.Json;
import sg.edu.nus.iss.project.services.StockService;
import sg.edu.nus.iss.project.services.UserService;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping(path = "/api")
public class StockController {

    @Autowired
    private StockService stockSvc;

    @Autowired
    private UserService userSvc;

    @GetMapping(path = "/stocks")
    public ResponseEntity<String> getStocksData(@RequestParam String symbol,
            @RequestParam(defaultValue = "10") int outputsize) {
        return stockSvc.getStockData(symbol, outputsize);
    }

    @GetMapping(path = "/{symbol}/price")
    public ResponseEntity<String> getStockPrice(@PathVariable String symbol,
            @RequestParam(defaultValue = "10") int outputsize) {
        return stockSvc.getStockPrice(symbol, outputsize);

    }

    @GetMapping(path = "/{symbol}/stonkprice")
    public ResponseEntity<String> getStonkStockPrice(@PathVariable String symbol, @RequestParam String userId) {

        Optional<Double> optPrice = userSvc.retrieveUserStockMarketValueRedis(userId, symbol);
        if (optPrice.isPresent()) {
            double marketPrice = optPrice.get();
            return ResponseEntity.status(HttpStatus.OK)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder()
                            .add("price", marketPrice)
                            .build().toString());
        }

        System.out.println("Calling stonk price >>> " + symbol);
        return stockSvc.getRealStonksPrice(symbol);
    }

}
