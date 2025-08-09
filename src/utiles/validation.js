const validator = require('validator');

const validateSignUpData = (req) => {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName) {
        throw new Error("name is not valid");
    } else if (!validator.isEmail(email)) {
        throw Error("email not valid");
    } else if (!validator.isStrongPassword(password)) {
        throw new Error("password is not valid");
    }
};

const validateEditProfileData = (req) => {
    const allowedEditFields = [
        "firstName",
        "lastName",
        "email",
        "gender",
        "age",
    ];
    const isEditAllowed = Object.keys(req.body).every((field) =>
        allowedEditFields.includes(field)
    );
    return isEditAllowed;
};


module.exports = {
    validateSignUpData,
    validateEditProfileData,
}; 