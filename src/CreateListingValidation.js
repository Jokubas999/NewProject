function validation(values) {
    let error = {}
    let regex = /^\d+$/;

    if (values.title === "") {
        error.error = "Title is required";
    } else if (values.category === "") {
        error.error = "Category is required";
    } else if (values.description === "") {
        error.error = "Description is required";
    } else if (values.price === "") {
        error.error = "Price is required";
    } else if (isNaN(values.price) || parseFloat(values.price) <= 0) {
        error.error = "Price must be a positive number";
    } else if (regex.test(values.price)) {
        error.error = "Price must be a decimal number";
    } else {
        error.error = "";
    }

    return error;
}

export default validation;
