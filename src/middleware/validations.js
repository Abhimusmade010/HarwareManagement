

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  console.log("inside validate !!")
  
  if (!result.success) {
    const errors = result.error?.errors;

    if (!errors || errors.length === 0) {
      return res.status(400).json({
        error: "Invalid or empty request body"
      });
    }

    return res.status(400).json({
      error: errors[0].message
    });
  }


  req.body = result.data;
  next();
};

export default validate;
