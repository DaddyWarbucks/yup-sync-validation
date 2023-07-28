const yup = require('yup')

const person = {
  firstName: "Johnny",
  lastName: "Cash"
};

const people = Array(10000)
  .fill(0)
  .map((_, index) => {
    return {
      _id: index,
      createdAt: new Date(),
      updatedAt: new Date(),
      firstName: person.firstName + index,
      lastName: person.lastName + index,
      nickName: person.lastName + index,
      company: person.lastName + index,
      title: person.lastName + index,
      notes: person.lastName + index,
      emails: [
        { type: "HOME", value: "na@example.com", default: false },
        { type: "HOME", value: "na@example.com", default: false },
        { type: "HOME", value: "na@example.com", default: false }
      ],
      phones: [
        { type: "HOME", value: "na@example.com", default: false },
        { type: "HOME", value: "na@example.com", default: false },
        { type: "HOME", value: "na@example.com", default: false }
      ],
      dates: [
        { type: "HOME", value: new Date(), default: false },
        { type: "HOME", value: new Date(), default: false },
        { type: "HOME", value: new Date(), default: false }
      ],
      websites: [
        { type: "HOME", value: new Date(), default: false },
        { type: "HOME", value: new Date(), default: false },
        { type: "HOME", value: new Date(), default: false }
      ],
      socials: [
        { type: "HOME", value: "na@example.com", default: false },
        { type: "HOME", value: "na@example.com", default: false },
        { type: "HOME", value: "na@example.com", default: false }
      ]
    };
  });

console.log("Total People: ", people.length);

const syncSchema = yup.object({
  _id: yup.string().trim().matches("^[a-zA-Z0-9]*$").label("ID"),
  createdAt: yup.date().label("Created At"),
  updatedAt: yup.date().label("Updated At"),
  firstName: yup
    .string()
    .trim()
    .label("First Name"),
  lastName: yup.string().trim().label("Last Name"),
  nickName: yup.string().trim().label("Nickname"),
  company: yup.string().trim().label("Company"),
  title: yup.string().trim().label("Title"),
  avatar: yup.string().trim().label("Avatar"),
  emails: yup
    .array()
    .min(1)
    .label("Emails")
    .of(
      yup.object({
        type: yup.string().trim().required().label("Email Type"),
        value: yup.string().trim().email().required().label("Email"),
        default: yup.boolean().label("Default")
      })
    ),
  phones: yup
    .array()
    .min(1)
    .label("Phone Numbers")
    .of(
      yup.object({
        type: yup.string().trim().required().label("Phone Number Type"),
        value: yup.string().trim().required().label("Phone Number"),
        default: yup.boolean().label("Default")
      })
    ),
  dates: yup
    .array()
    .min(1)
    .label("Dates")
    .of(
      yup.object({
        type: yup.string().trim().required().label("Date Type"),
        value: yup.string().trim().required().label("Date"),
        default: yup.boolean().label("Default")
      })
    ),
  websites: yup
    .array()
    .min(1)
    .label("Websites")
    .of(
      yup.object({
        type: yup.string().trim().required().label("Website Type"),
        value: yup.string().trim().required().label("Website"),
        default: yup.boolean().label("Default")
      })
    ),
  socials: yup
    .array()
    .min(1)
    .label("Socials")
    .of(
      yup.object({
        type: yup.string().trim().required().label("Social Type"),
        value: yup
          .string()
          .transform((value, originalValue, ctx) => {
            if (ctx.isType(value) && value.startsWith("@")) {
              return value.substring(1);
            }
            return value;
          })
          .trim()
          .required()
          .label("Username"),
        default: yup.boolean().label("Default")
      })
    )
});

const asyncSchema = syncSchema.shape({
  firstName: yup
  .string()
  .trim()
  .label("First Name")
  .test({
    name: "async",
    exclusive: true,
    message: "Oh dear",
    test: async function () {
      return true;
    }
  })
})

const validateAsync = async (data) => {
  return asyncSchema.validate(data, { abortEarly: false, stripUnknown: true });
};

const validateSync = (data) => {
  return syncSchema.validateSync(data, { abortEarly: false, stripUnknown: true });
};

(async () => {
  console.time("validateAsync");
  await validateAsync(people[0]);
  console.timeEnd("validateAsync");

  console.time("validateSync");
  validateSync(people[0]);
  console.timeEnd("validateSync");

  console.time("validateSync.loop");
  for (let i = 0; i < people.length; i++) {
    const person = people[i];
    validateAsync(person);
  }
  console.timeEnd("validateSync.loop");

  console.time("validateAsync.loop");
  for (let i = 0; i < people.length; i++) {
    const person = people[i];
    await validateAsync(person);
  }
  console.timeEnd("validateAsync.loop");

  console.time("validateAsync.all");
  await Promise.allSettled(
    people.map(async (person, index) => {
      // console.time("multi" + index);
      return validateAsync(person);
      // console.timeEnd("multi" + index);
    })
  );
  console.timeEnd("validateAsync.all");
})();
