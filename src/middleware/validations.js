

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  console.log("inside validate !!")
  
  if (!result.success) {
    const errors = result.error?.issues;

    console.log("after resullt got!")
    
    console.log(errors)
    if (!errors || errors.length === 0) {
      return res.status(400).json({
        error: "Invalid or empty request body"
      });
    }
    console.log("after resullt 1111!")
    return res.status(400).json({
      error: errors[0].message
    });
  }

  console.log("leaving the validate")
  req.body = result.data;
  next();
};

export default validate;
