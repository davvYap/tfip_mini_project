package sg.edu.nus.iss.project.controllers;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import jakarta.json.Json;
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonObjectBuilder;
import sg.edu.nus.iss.project.models.Category;
import sg.edu.nus.iss.project.models.RegularTransaction;
import sg.edu.nus.iss.project.models.Transaction;
import sg.edu.nus.iss.project.services.TransactionService;

@Controller
@CrossOrigin(origins = "*")
@RequestMapping("/api")
public class TransactionController {

	@Autowired
	private TransactionService transSvc;

	@PostMapping(path = "/{userId}/add_category", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
	@ResponseBody
	public ResponseEntity<String> insertCategoryJdbc(@PathVariable String userId,
			@RequestBody MultiValueMap<String, String> categoryForm) {
		String category = categoryForm.getFirst("category");
		String type = categoryForm.getFirst("type");

		// Check if duplicate name and type
		List<Category> categories = transSvc.getUserCategoryJdbc(userId);
		for (Category cat : categories) {
			if (cat.getCategoryName().equals(category) && cat.getType().equals(type)) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST)
						.contentType(MediaType.APPLICATION_JSON)
						.body(Json.createObjectBuilder()
								.add("message", "%s (%s) category exists".formatted(category, type.toUpperCase()))
								.build().toString());
			}
		}

		int res = transSvc.insertCategoryJdbc(userId, category, type);
		if (res <= 0) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.contentType(MediaType.APPLICATION_JSON)
					.body(Json.createObjectBuilder()
							.add("message", "Category not added".formatted(category))
							.build().toString());
		}
		return ResponseEntity.status(HttpStatus.CREATED)
				.contentType(MediaType.APPLICATION_JSON)
				.body(Json.createObjectBuilder()
						.add("message", "Category %s (%s) added succesffuly".formatted(category, type.toUpperCase()))
						.build().toString());
	}

	@GetMapping(path = "/{userId}/categories")
	@ResponseBody
	public ResponseEntity<String> getUserCategoriesJdbc(@PathVariable String userId) {
		List<Category> categories = transSvc.getUserCategoryJdbc(userId);

		JsonArrayBuilder jsArr = Json.createArrayBuilder();
		categories.stream().forEach(cat -> jsArr.add(cat.toJsonObjectBuilder()));

		return ResponseEntity.status(HttpStatus.OK)
				.contentType(MediaType.APPLICATION_JSON)
				.body(jsArr.build().toString());
	}

	@PutMapping(path = "/{userId}/update_category")
	@ResponseBody
	public ResponseEntity<String> editUserCategoryJdbc(@PathVariable String userId, @RequestBody String catJson)
			throws IOException {
		Category cat = Category.convertFromJsonString(catJson);
		// Check if duplicate name and type
		List<Category> categories = transSvc.getUserCategoryJdbc(userId);
		for (Category category : categories) {
			if (category.getCategoryName().equals(cat.getCategoryName()) && category.getType().equals(cat.getType())) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST)
						.contentType(MediaType.APPLICATION_JSON)
						.body(Json.createObjectBuilder()
								.add("message",
										"%s (%S) category exists".formatted(cat.getCategoryName(),
												cat.getType().toUpperCase()))
								.build().toString());
			}
		}
		int updatedRow = transSvc.editCategoryJdbc(userId, cat.getCategoryId(), cat.getCategoryName(), cat.getType());

		if (updatedRow > 0) {
			return ResponseEntity.status(HttpStatus.CREATED)
					.contentType(MediaType.APPLICATION_JSON)
					.body(Json.createObjectBuilder().add("message", "Update category successfully").build().toString());
		}
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.contentType(MediaType.APPLICATION_JSON)
				.body(Json.createObjectBuilder().add("message", "Update category failed").build()
						.toString());
	}

	@GetMapping(path = "/{userId}/transactions")

	@ResponseBody
	public ResponseEntity<String> getUserTransactionsJdbc(@PathVariable String userId, @RequestParam String year) {
		int yearInt = Integer.parseInt(year);
		List<Transaction> transactions = transSvc.getUserTransactionsJdbc(userId, yearInt);
		JsonArrayBuilder jsArr = Json.createArrayBuilder();
		transactions.stream().forEach((trans) -> jsArr.add(trans.toJsonObjectBuilder()));
		return ResponseEntity.status(HttpStatus.OK)
				.contentType(MediaType.APPLICATION_JSON)
				.body(jsArr.build().toString());
	}

	@GetMapping(path = "/{userId}/category_id")
	@ResponseBody
	public ResponseEntity<String> getCategoryIdByCategoryNameJdbc(@PathVariable String userId,
			@RequestParam String catName) {
		int catId = transSvc.getCategoryIdByCategoryNameJdbc(userId, catName);
		if (catId == 0) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.contentType(MediaType.APPLICATION_JSON)
					.body(Json.createObjectBuilder().add("message", "Invalid category name").build()
							.toString());
		}
		return ResponseEntity.status(HttpStatus.OK)
				.contentType(MediaType.APPLICATION_JSON)
				.body(Json.createObjectBuilder().add("value", catId).build().toString());
	}

	@PostMapping(path = "/{userId}/add_transaction")
	@ResponseBody
	public ResponseEntity<String> insertTransactionJdbc(@PathVariable String userId, @RequestBody String json) {
		Transaction tran = null;
		try {
			tran = Transaction.convertFromJsonAdd(json);

			int insertedRow = transSvc.insertTransactionJdbc(userId, tran);
			// check if it is regular transaction
			if (tran.isRegularTransaction()) {
				transSvc.insertRegularTransactionJdbc(userId, tran.getTransactionId(), true);
			}

			if (insertedRow > 0) {
				return ResponseEntity.status(HttpStatus.CREATED)
						.contentType(MediaType.APPLICATION_JSON)
						.body(Json.createObjectBuilder()
								.add("message",
										"Transaction (%s) successfully added"
												.formatted(tran.getTransactionName()))
								.build()
								.toString());
			}
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.contentType(MediaType.APPLICATION_JSON)
					.body(Json.createObjectBuilder().add("message", "Invalid transaction format")
							.build().toString());

		} catch (IOException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.contentType(MediaType.APPLICATION_JSON)
					.body(Json.createObjectBuilder().add("message", "Invalid transaction format")
							.build().toString());
		}

	}

	@DeleteMapping(path = "/{userId}/delete_transaction")
	@ResponseBody
	public ResponseEntity<String> deleteTransactionJdbc(@PathVariable String userId, @RequestParam String tranId,
			@RequestParam String catName) {

		// check if there is recursive transaction link to this transaction
		List<RegularTransaction> reguTrans = transSvc.getUserRegularTransactionsJdbc(userId);
		for (RegularTransaction regularTransaction : reguTrans) {
			if (regularTransaction.getTranId().equals(tranId)) {
				System.out.println("Attempt to delete transaction link to recursive transaction");
				return ResponseEntity.status(HttpStatus.BAD_REQUEST)
						.contentType(MediaType.APPLICATION_JSON)
						.body(Json.createObjectBuilder()
								.add("message",
										"Selected transaction linked to a regular transaction. Please remove the regular transaction.")
								.build()
								.toString());
			}
		}

		int deletedRow = transSvc.deleteTransactionJdbc(userId, tranId, catName);
		if (deletedRow > 0) {
			return ResponseEntity.status(HttpStatus.CREATED)
					.contentType(MediaType.APPLICATION_JSON)
					.body(Json.createObjectBuilder()
							.add("message",
									"Transaction (%s) successfully removed"
											.formatted(tranId))
							.build()
							.toString());
		}
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.contentType(MediaType.APPLICATION_JSON)
				.body(Json.createObjectBuilder().add("message", "Failed to remove transaction").build()
						.toString());

	}

	@PutMapping(path = "/{userId}/update_transaction")
	@ResponseBody
	public ResponseEntity<String> updateTransactionJdbc(@PathVariable String userId, @RequestBody String json) {
		try {
			Transaction updateTransaction = Transaction.convertFromJsonUpdate(json);
			int updatedCount = transSvc.updateTransactionJdbc(userId, updateTransaction);
			if (updatedCount > 0) {
				return ResponseEntity.status(HttpStatus.CREATED)
						.contentType(MediaType.APPLICATION_JSON)
						.body(Json.createObjectBuilder()
								.add("message",
										"Transaction (%s) was successfully updated."
												.formatted(updateTransaction
														.getTransactionId()))
								.build().toString());
			}
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.contentType(MediaType.APPLICATION_JSON)
					.body(Json.createObjectBuilder().add("message", "Invalid transaction format")
							.build().toString());
		} catch (IOException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.contentType(MediaType.APPLICATION_JSON)
					.body(Json.createObjectBuilder().add("message", "Invalid transaction format")
							.build().toString());
		}

	}

	@GetMapping(path = "/{userId}/all_trans")
	@ResponseBody
	public ResponseEntity<String> getUserAllTransactions(@PathVariable String userId) {

		List<Transaction> trans = transSvc.getUserAllTransactionsJdbc(userId);

		JsonArrayBuilder jsArr = Json.createArrayBuilder();
		trans.stream().forEach((tran) -> {
			jsArr.add(tran.toJsonObjectBuilder());
		});

		return ResponseEntity.status(HttpStatus.OK)
				.contentType(MediaType.APPLICATION_JSON)
				.body(jsArr.build().toString());
	}

	@GetMapping(path = "/{userId}/trans_month_year")
	@ResponseBody
	public ResponseEntity<String> geTransactionsBasedOnMonthAndYearJdbc(@PathVariable String userId,
			@RequestParam String month, @RequestParam String year) {
		int monthInt = Integer.parseInt(month);
		int yearInt = Integer.parseInt(year);
		List<Transaction> trans = transSvc.geTransactionsBasedOnMonthAndYearJdbc(userId, monthInt, yearInt);

		JsonArrayBuilder jsArr = Json.createArrayBuilder();
		trans.stream().forEach((tran) -> {
			jsArr.add(tran.toJsonObjectBuilder());
		});

		return ResponseEntity.status(HttpStatus.OK)
				.contentType(MediaType.APPLICATION_JSON)
				.body(jsArr.build().toString());
	}

	@GetMapping(path = "/{userId}/trans_dates")
	@ResponseBody
	public ResponseEntity<String> geTransactionsBasedOnDatesJdbc(@PathVariable String userId,
			@RequestParam String startDate, @RequestParam String endDate) {

		List<Transaction> trans = transSvc.geTransactionsBasedOnDatesJdbc(userId, startDate, endDate);

		JsonArrayBuilder jsArr = Json.createArrayBuilder();
		trans.stream().forEach((tran) -> {
			jsArr.add(tran.toJsonObjectBuilder());
		});

		return ResponseEntity.status(HttpStatus.OK)
				.contentType(MediaType.APPLICATION_JSON)
				.body(jsArr.build().toString());
	}

	@GetMapping(path = "/{userId}/all_regular_trans")
	@ResponseBody
	public ResponseEntity<String> getUserAllRegularTransactions(@PathVariable String userId) {

		List<RegularTransaction> trans = transSvc.getUserRegularTransactionsJdbc(userId);

		JsonArrayBuilder jsArr = Json.createArrayBuilder();

		for (RegularTransaction regTran : trans) {
			Transaction tran = transSvc.getUserTransactionBasedOnTransIdJdbc(userId, regTran.getTranId());
			JsonObjectBuilder jsObj = Json.createObjectBuilder()
					.add("id", regTran.getRegularTranId())
					.add("tran", tran.toJsonObjectBuilder())
					.add("active", regTran.isActive());
			jsArr.add(jsObj);
		}
		// trans.stream().forEach((tran) -> {
		// jsArr.add(tran.toJsonObjectBuilder());
		// });

		return ResponseEntity.status(HttpStatus.OK)
				.contentType(MediaType.APPLICATION_JSON)
				.body(jsArr.build().toString());
	}

	@DeleteMapping(path = "/{userId}/delete_regular_tran")
	@ResponseBody
	public ResponseEntity<String> deleteUserRegularTransaction(@PathVariable String userId,
			@RequestParam String regTranId, @RequestParam String regTranName) {
		int deletedRow = transSvc.deleteUserRegularTransactionJdbc(userId, regTranId);

		if (deletedRow > 0) {
			return ResponseEntity.status(HttpStatus.CREATED)
					.contentType(MediaType.APPLICATION_JSON)
					.body(Json.createObjectBuilder()
							.add("message", "Successfully deleted regular transaction %s".formatted(regTranName))
							.build().toString());
		}
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.contentType(MediaType.APPLICATION_JSON)
				.body(Json.createObjectBuilder()
						.add("message", "Fail to delete regular transaction %s".formatted(regTranName))
						.build().toString());
	}

	@PutMapping(path = "/{userId}/toggle_regular_tran")
	@ResponseBody
	public ResponseEntity<String> toggleUserRegularTransactionActive(@PathVariable String userId,
			@RequestParam boolean active, @RequestParam String regTranId) {
		System.out.println("active > " + active);
		int toggled = transSvc.toggleUserRegularTransactionActive(active, userId, regTranId);

		if (toggled > 0) {
			String regTranActive = active ? "Activated" : "Deactivated";

			return ResponseEntity.status(HttpStatus.CREATED)
					.contentType(MediaType.APPLICATION_JSON)
					.body(Json.createObjectBuilder()
							.add("message", "%s".formatted(regTranActive))
							.build().toString());
		}
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.contentType(MediaType.APPLICATION_JSON)
				.body(Json.createObjectBuilder()
						.add("message", "Fail to update regular transaction state")
						.build().toString());
	}

}
