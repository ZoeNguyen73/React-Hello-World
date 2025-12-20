import FormProjectPageOne from "./FormProjectPageOne";
import FormProjectPageTwo from "./FormProjectPageTwo";
import { useState, useContext, useEffect } from "react";
import AuthContext from "../../context/AuthProvider";
import { useLocation, useNavigate } from "react-router-dom";
import Confirmation from "./Confirmation";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import axiosMain from "axios";
import LoginCheck from "../login-check/LoginCheck";

function MultiForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState(null);
  const [message, setMessage] = useState(null);
  const [isEdit] = useState(location.state?.isEdit);
  const [imageFilesToConvert, setImageFilesToConvert] = useState([]);
  const [editProjectSlug] = useState(location.state?.project?.slug);
  const [imagesToBeDeleted, setImagesToBeDeleted] = useState([]);

  const createNewForm = {
    step: location.search ? parseInt(location.search.slice(-1)) : 1,
    username: auth.username,
    title: "",
    tagline: "",
    categories: [],
    logo_url: "",
    state: "",
    description: "",
    image_urls: [],
  };
  const editForm = {
    step: location.search ? parseInt(location.search.slice(-1)) : 1,
    username: auth.username,
    title: location.state?.project?.title,
    tagline: location.state?.project?.tagline,
    categories: location.state?.project?.categories,
    logo_url: location.state?.project?.logo_url,
    state: location.state?.project?.state,
    description: location.state?.project?.description,
    image_urls: location.state?.project?.image_urls,
  };

  const [form, setForm] = useState(isEdit ? editForm : createNewForm);
  
  // Update the form when images to be deleted have been chosen
  useEffect(() => {
    setForm((prevState) => ({ ...prevState, deleted_images: imagesToBeDeleted }));
  }, [imagesToBeDeleted])

  const [previewLogo, setPreviewLogo] = useState(isEdit ? form.logo_url : null);
  const [previewProjectImages, setPreviewProjectImages] = useState(
    isEdit ? form.image_urls : []
  );

  const locationCheckedState = {};
  if (isEdit) {
    form.categories.forEach((category) => {
      locationCheckedState[category] = true;
    });
  }

  const [checkedCategories, setCheckedCategories] = useState(
    isEdit ? form.categories : []
  );
  const [checkedState, setCheckedState] = useState(
    isEdit ? locationCheckedState : {}
  );

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

  // Set snackbar alerts
  const snackbarAlert = (open, severity, message) => {
    setOpen(open);
    setSeverity(severity);
    setMessage(message);
  };

  // Set the step to 1 if coming in via /projects/create
  useEffect(() => {
    if (!location.search) {
      if (isEdit) {
        navigate(`/projects/${editProjectSlug}/edit?step=${step}`);
      } else {
        navigate(`/projects/create?step=${step}`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Proceed to next step
  const nextStep = () => {
    const { step } = form;
    setForm((prevState) => ({ ...prevState, step: step + 1 }));
    if (isEdit) {
      navigate(`/projects/${editProjectSlug}/edit?step=${step + 1}`);
    } else {
      navigate(`/projects/create?step=${step + 1}`);
    }
  };

  // Go back to previous step
  const prevStep = () => {
    const { step } = form;
    setForm((prevState) => ({ ...prevState, step: step - 1 }));
    if (isEdit) {
      navigate(
        `/projects/${location.state.project.slug}/edit?step=${step - 1}`
      );
    } else {
      navigate(`/projects/create?step=${step - 1}`);
    }
  };

  // Handle field change
  const handleChange = (input) => (event) => {
    if (input === "categories") {
      if (event.target.checked) {
        setCheckedCategories((prevState) => [...prevState, event.target.value]);
      } else {
        setCheckedCategories(
          checkedCategories.filter((value) => {
            return value !== event.target.value;
          })
        );
      }
    } else {
      setForm((prevState) => ({
        ...prevState,
        [input]: event.target.value,
      }));
    }
  };

  // When the checked boxes has been updated, update the form
  useEffect(() => {
    setForm((prevState) => ({
      ...prevState,
      categories: checkedCategories,
    }));
  }, [checkedCategories]);

  // Handle file input
  const convertFilesToFormData = () => {
    return new Promise((resolve) => {
      const files = imageFilesToConvert;
      const formData = new FormData();
      for (let i = 0, len = files.length; i < len; i++) {
        formData.append(`image_urls`, files[i].file, files[i].name);
      }
      return resolve(formData);
    });
  };

  const handleFileInput = (input) => (event) => {
    event.preventDefault();
    // If the number of images added is 4 or more return early with and error
    if (previewProjectImages.length >= 4 || event.target.files.length > 4) {
      snackbarAlert(
        true,
        "warning",
        "Only 4 photos may be uploaded to any project"
      );
      return;
    }
    // If not, deal with the remainder of the images
    if (event.target.multiple) {
      const files = event.target.files;

      const arrFiles = [];
      const filesToConvert = [];
      // const formData = new FormData();
      for (let i = 0, len = files.length; i < len; i++) {
        const blob = URL.createObjectURL(files[i]);
        arrFiles.push(blob);
        filesToConvert.push({ file: files[i], name: blob });
      }
      setImageFilesToConvert((prevState) => [...prevState, ...filesToConvert]);
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

  //Handle image delete
  const handleDeleteImageFromUpload = (event) => {
    event.preventDefault();
    const selected = event.target.id;
    if (isEdit) {
      setImagesToBeDeleted((prevState) => ([...prevState, selected]));
    }
    // // Delete fom the preview images
    setPreviewProjectImages(
      previewProjectImages.filter((image) => {
        return image !== selected;
      })
    );
    setImageFilesToConvert(imageFilesToConvert.filter((image) => {
      return image.name !== selected;
    }));
  };

  // Handle save as draft
  const saveDraft = async (event) => {
    event.preventDefault();
    const convertedFiles = await convertFilesToFormData();
    const request = isEdit
      ? {
          method: "put",
          url: `/projects/${editProjectSlug}`,
          data: { ...form, state: "draft" },
        }
      : { method: "post", url: "/projects", data: { ...form, state: "draft" } };
    const config = {
      headers: {
        // "Content-Type": "multipart/form-data boundary=???",
      },
    };

    // Send post request to projects
    axiosPrivate(request).then(
      (response) => {
        const routeOne = isEdit
          ? {
              method: "put",
              url: `/projects/${editProjectSlug}/upload`,
              data: form.logo_url_files,
              ...config,
            }
          : {
              method: "post",
              url: `/projects/upload?slug=${response.data.slug}`,
              data: form.logo_url_files,
              ...config,
            };
        const routeTwo = isEdit
          ? {
              method: "put",
              url: `/projects/${editProjectSlug}/upload`,
              data: convertedFiles,
              ...config,
            }
          : {
              method: "post",
              url: `/projects/upload?slug=${response.data.slug}`,
              data: convertedFiles,
              ...config,
            };
        const photoRequestOne = axiosPrivate(routeOne);
        const photoRequestTwo = axiosPrivate(routeTwo);
        axiosMain.all([photoRequestOne, photoRequestTwo]).then(
          axiosMain.spread((...responses) => {
            snackbarAlert(
              true,
              "success",
              "Project successfully saved to draft"
            );
            setTimeout(() => {
              navigate(`/projects/${response.data.slug}`);
            }, 2000);
          }),
          axiosMain.spread((...errors) => {
            snackbarAlert(true, "error", "Ooops, something went wrong...");
          })
        );
      },
      (error) => {
        snackbarAlert(
          true,
          "error",
          error?.response?.data?.error || "Ooops, something went wrong..."
        );
      }
    );
  };

  // Handle publish
  const publish = async (event) => {
    event.preventDefault();
    const convertedFiles = await convertFilesToFormData();

    const request = isEdit
      ? {
          method: "put",
          url: `/projects/${editProjectSlug}`,
          data: { ...form, state: "published" },
        }
      : { method: "post", url: "/projects", data: { ...form, state: "published" } };
    
      const config = {
      headers: {
        // "Content-Type": "multipart/form-data boundary=???",
      },
    };

    axiosPrivate(request).then(
      (response) => {
        const routeOne = isEdit
          ? {
              method: "put",
              url: `/projects/${editProjectSlug}/upload`,
              data: form.logo_url_files,
              ...config,
            }
          : {
              method: "post",
              url: `/projects/upload?slug=${response.data.slug}`,
              data: form.logo_url_files,
              ...config,
            };
        const routeTwo = isEdit
          ? {
              method: "put",
              url: `/projects/${editProjectSlug}/upload`,
              data: convertedFiles,
              ...config,
            }
          : {
              method: "post",
              url: `/projects/upload?slug=${response.data.slug}`,
              data: convertedFiles,
              ...config,
            };
        const photoRequestOne = axiosPrivate(routeOne);
        const photoRequestTwo = axiosPrivate(routeTwo);
        axiosMain.all([photoRequestOne, photoRequestTwo]).then(
          axiosMain.spread((...responses) => {
            snackbarAlert(true, "success", "Project successfully published");
            setTimeout(() => {
              navigate(`/projects/${response.data.slug}`);
            }, 2000);
          }),
          axiosMain.spread((...errors) => {
            snackbarAlert(true, "error", "Oops, something went wrong...");
          })
        );
      },
      (error) => {
        console.log("error: " + JSON.stringify(error));
        snackbarAlert(
          true,
          "error",
          error?.response?.data?.error || "Oops, something went wrong..."
        );
      }
    );
  };

  if (!auth?.username) return <LoginCheck />;

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
          open={open}
          severity={severity}
          message={message}
          setOpen={setOpen}
          values={values}
          handleDeleteImageFromUpload={handleDeleteImageFromUpload}
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
          isEdit={isEdit}
        />
      );
    default:
      break;
  }
}

export default MultiForm;
