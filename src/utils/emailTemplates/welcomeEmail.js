import sendEmail from "../sendEmail.js";


const welcomeEmail = async (newUser) => {
    await sendEmail({
        to: newUser.Email,

    subject: "Welcome to Complaint Management System",

    html: `
        <h2>Welcome ${newUser.Name}</h2>

        <p>Your account has been created successfully.</p>

        <p>You can now login and submit complaints.</p>
    `
});
};


const welcomeMaintenanceEmail = async (newUser, tempPassword) => {
    await sendEmail({
        to: newUser.Email,
        subject: "Maintenance Account Created",
        html: `
            <h2>Hello ${newUser.Name}</h2>
            <p>Your maintenance account has been created.</p>
            <p>Email: ${newUser.Email}</p>
            <p>Temporary Password: ${tempPassword}</p>
            <p>Please login and change your password immediately.</p>
        `
    });
};

export {welcomeEmail, welcomeMaintenanceEmail};