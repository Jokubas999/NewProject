function validation(values) {
    let error = {}
    const password_pattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if (values.username === "") {
        error.error = "Username is required";
    } else if (values.password === "") {
        error.error = "Password is required";
    } else if (!password_pattern.test(values.password)) {
        error.error = "Password doesn't match";
    } else {
        error.error = "";
    }

    return error;
}

export default validation;
