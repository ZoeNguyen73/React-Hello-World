import FormProjectPageOne from "./FormProjectPageOne";
import FormProjectPageTwo from "./FormProjectPageTwo";
import { useState, useContext, useEffect } from "react";
import AuthContext from "../../context/AuthProvider";
import { useLocation, useNavigate } from "react-router-dom";
import Confirmation from "./Confirmation";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import axiosMain from "axios";

function MultiForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useContext(AuthContext);
  const [previewLogo, setPreviewLogo] = useState(null);
  const [previewProjectImages, setPreviewProjectImages] = useState([]);
  const [checkedCategories, setCheckedCategories] = useState([]);
  const [checkedState, setCheckedState] = useState({});
  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState(null);
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState({
    step: location.search ? parseInt(location.search.slice(-1)) : 1,
    username: auth.username,
    title: "",
    tagline: "",
    categories: checkedCategories,
    logo_url: "",
    state: "",
    description: "",
    image_urls: [],
  });
  const {
    step,
    username,
    title,
    tagline,
    categories,
    logo_url,
    state,
    description,
    image_urls,
  } = form;
  const values = {
    step,
    username,
    title,
    tagline,
    categories,
    logo_url,
    state,
    description,
    image_urls,
  };
  // Keep track of the checked boxes
  const checkboxTrack = (checkedBoxes) => {
    setCheckedState((prevState) => ({
      ...prevState,
      ...checkedBoxes,
    }));
  };
  // Set the step to 1 if coming in via /projects/create
  useEffect(() => {
    if (!location.search) {
      navigate(`/projects/create?step=${step}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Proceed to next step
  const nextStep = () => {
    const { step } = form;
    setForm((prevState) => ({ ...prevState, step: step + 1 }));
    navigate(`/projects/create?step=${step + 1}`);
  };
  // Go back to previous step
  const prevStep = () => {
    const { step } = form;
    setForm((prevState) => ({ ...prevState, step: step - 1 }));
    navigate(`/projects/create?step=${step - 1}`);
  };
  // Handle field change
  const handleChange = (input) => (event) => {
    if (input === "categories") {
      if (event.target.checked) {
        setCheckedCategories((prevState) => [...prevState, event.target.value]);
        setForm((prevState) => ({
          ...prevState,
          [input]: checkedCategories,
        }));
      } else {
        setCheckedCategories(
          checkedCategories.filter((value) => {
            return value !== event.target.value;
          })
        );
        setForm((prevState) => ({
          ...prevState,
          [input]: checkedCategories,
        }));
      }
    } else {
      setForm((prevState) => ({
        ...prevState,
        [input]: event.target.value,
      }));
    }
  };
  // Handle file input
  const handleFileInput = (input) => (event) => {
    if (event.target.multiple) {
      const files = event.target.files;
      const arrFiles = [];
      const formData = new FormData();
      for (let i = 0, len = files.length; i < len; i++) {
        arrFiles.push(URL.createObjectURL(files[i]));
        formData.append(
          `image_urls`,
          event.target.files[i],
          event.target.files[i].name
        );
        
      }
      setForm((prevState) => ({
          ...prevState,
          [input]: formData,
        }));
      setPreviewProjectImages((prevState) => [...prevState, ...arrFiles]);
      return;
    }
    setPreviewLogo(URL.createObjectURL(event.target.files[0]));
    const formData = new FormData();
    formData.append(
      "logo_url",
      event.target.files[0],
      event.target.files[0].name
    );
    setForm((prevState) => ({
      ...prevState,
      [input]: formData,
    }));
  };
  // Handle save as draft
  const saveDraft = (event) => {
    event.preventDefault();

    const config = {
      headers: {
        "Content-Type": "multipart/form-data boundary=???",
      },
    };
    // Send post request to projects
    axiosPrivate.post("/projects", { ...form, state: "draft" }).then(
      (response) => {
        const photoRequestOne = axiosPrivate.post(
          `/projects/upload?slug=${response.data.slug}`,
          form.logo_url,
          config
        );
        const photoRequestTwo= axiosPrivate.post(
          `/projects/upload?slug=${response.data.slug}`,
          form.image_urls,
          config
        );
        axiosMain
          .all([photoRequestOne, photoRequestTwo])
          .then(
            axiosMain.spread((...responses) => {
              navigate(`/projects/${response.data.slug}`);
            }),
            axiosMain.spread((...errors) => {
              console.log("Image Error: ", errors);
            })
          );
      },
      (error) => {
        // TODO error handling
        // If error snack bar with details
        console.log("Error: ", error);
      }
    );
  };
  // Handle publish
  const publish = (event) => {
    event.preventDefault();
    console.log(form);
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    axiosPrivate.post("/projects", { ...form, state: "published" }).then(
      (response) => {
        axiosPrivate
          .post(
            `/projects/upload?slug=${response.data.slug}`,
            { logo_url: form["logo_url"], image_urls: form["image_urls"] },
            config
          )
          .then(
            (responseTwo) => {
              setOpen(true);
              setSeverity("success");
              setMessage("Project successfully created");
              setTimeout(() => {
                navigate(`/projects/${response.data.slug}`);
              }, 2000);
            },
            (error) => {
              setOpen(true);
              setSeverity("error");
              setMessage(error.response.data.error);
            }
          );
        // Reroute to project you just published
      },
      (error) => {
        // TODO error handling
        // If error snack bar with details
        console.log("Error: ", error);
      }
    );
  };
  switch (step) {
    case 1:
      return (
        <FormProjectPageOne
          nextStep={nextStep}
          prevStep={prevStep}
          handleChange={handleChange}
          handleFileInput={handleFileInput}
          values={values}
          previewLogo={previewLogo}
          checkBoxTrack={checkboxTrack}
          checkedState={checkedState}
        />
      );
    case 2:
      return (
        <FormProjectPageTwo
          nextStep={nextStep}
          prevStep={prevStep}
          handleChange={handleChange}
          handleFileInput={handleFileInput}
          previewProjectImages={previewProjectImages}
          values={values}
        />
      );
    case 3:
      return (
        <Confirmation
          saveDraft={saveDraft}
          publish={publish}
          prevStep={prevStep}
          values={values}
          previewLogo={previewLogo}
          previewProjectImages={previewProjectImages}
          open={open}
          severity={severity}
          message={message}
          setOpen={setOpen}
        />
      );
    default:
      break;
  }
}

export default MultiForm;
