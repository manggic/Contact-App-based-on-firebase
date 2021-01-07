// https://firebase.google.com/docs/storage/web/upload-files#full_example
// https://www.npmjs.com/package/browser-image-resizer#asyncawait

import React, { useState, useContext, useEffect } from "react";
import firebase from "firebase/app";

import {
  Container,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Spinner,
  Row,
  Col
} from "reactstrap";

// to compress image before uploading to the server
import { readAndCompressImage } from "browser-image-resizer";

// configs for image resizing
//TODO: add image configurations
import { imageConfig } from "../utils/config"

// import { MdAddCircleOutline } from "react-icons/md";

import { v4 } from "uuid";

// context stuffs
import { ContactContext } from "../context/Context";
import { CONTACT_TO_UPDATE } from "../context/action.types";

import { useHistory } from "react-router-dom";

import { toast } from "react-toastify";

const AddContact = () => {
  // destructuring state and dispatch from context state
  const { state, dispatch } = useContext(ContactContext);

  const { contactToUpdate, contactToUpdateKey } = state;
  console.log( contactToUpdate)

  // history hooks from react router dom to send to different page
  const history = useHistory();

  // simple state of all component
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [star, setStar] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);

  // when their is the contact to update in the Context state
  // then setting state with the value of the contact
  // will changes only when the contact to update changes
  useEffect(() => {
    if (contactToUpdate) {
      setName(contactToUpdate.name);
      setEmail(contactToUpdate.email);
      setPhoneNumber(contactToUpdate.phoneNumber);
      setAddress(contactToUpdate.address);
      setStar(contactToUpdate.star);
      setDownloadUrl(contactToUpdate.picture);

      // also setting is update to true to make the update action instead the addContact action
      setIsUpdate(true);
    }
  }, [contactToUpdate]);

  // To upload image to firebase and then set the the image link in the state of the app
  const imagePicker = async e => {
    // TODO: upload image and set D-URL to state

       try{
         //Its give me the entire path  that i want to upload 
          const file = e.target.files[0];
          console.log( e.target.files, file)

         //it stores inof related to the file ( file.type can be png/jpeg/jpg)    
         const metadata ={
           contentType : file.type
         }
          
         //compressing the image before uploading
         const resizedImage = await readAndCompressImage( file , imageConfig )  

         //storage reference 
         const storageRef = firebase.storage().ref();
         
         //it will create child of main ref - put require the image and metadata
         const uploadTask = storageRef.child( 'images/' + file.name ).put( resizedImage, metadata )

         // if any changes take place in database then it will give us snapshot as callback
         //which is big object
         uploadTask.on(
           firebase.storage.TaskEvent.STATE_CHANGED, 
           snapshot =>{
             setIsUploading(true)
             var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
             
             // Observe state change events such as progress, pause, and resume
             // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
           switch (snapshot.state) {
              case firebase.storage.TaskState.PAUSED: // or 'paused'
                setIsUploading(false)
                console.log('Upload is paused');
                break;
              case firebase.storage.TaskState.RUNNING: // or 'running'
                console.log('Upload is running');
                break;
            }

           if(progress === 100){
             setIsUploading(false);
             toast("Upload SuccessFul", { type: "success"})
           }

           },
           error =>{
             toast("Uploading Fail", { type: "error"})
           },
           ()=>{
             uploadTask.snapshot.ref.getDownloadURL()
                .then( downloadUrl =>{
                    setDownloadUrl(downloadUrl)
                }  )
                .catch( err => console.log(err))
           }
            
         )

       }catch( error ){
          console.log(error)
          toast( "something went wrong", {type: "error" } )
       }
         
  };

  // setting contact to firebase DB
  const addContact = async () => {
    //TODO: add contact method
    try{
        firebase
        .database()
        .ref("contacts/" + v4())
        .set({
          name,
           email,
            phoneNumber,
             address,
               picture : downloadUrl,
                star, 
        });
    }
    catch(error){
       console.log(error)  
    }
  };

  // to handle update the contact when there is contact in state and the user had came from clicking the contact update icon
  const updateContact = async () => {
    //TODO: update contact method

    try{
      firebase
      .database()
      .ref("contacts/" + contactToUpdateKey )
      .set({
        name,
         email,
          phoneNumber,
           address,
             picture : downloadUrl,
              star, 
      });
  }
  catch(error){
     console.log(error)  
  }
};
 // };

  // firing when the user click on submit button or the form has been submitted
  const handleSubmit = e => {
    e.preventDefault();
      if( name && phoneNumber && address &&  email && downloadUrl ){  
      isUpdate ? updateContact() : addContact();
    // isUpdate wll be true when the user came to update the contact
    // when their is contact then updating and when no contact to update then adding contact
    //TODO: set isUpdate value
    
   
    // to handle the bug when the user visit again to add contact directly by visiting the link
    dispatch({
      type: CONTACT_TO_UPDATE,
      payload: null,
      key: null
    });

    // after adding/updating contact then sending to the contacts
    // TODO :- also sending when their is any errors
    history.push("/");
  }
  else{
    toast("Fill the details !!!", { type:"warning"})
  }

  };

  // return the spinner when the image has been added in the storage
  // showing the update / add contact based on the  state
  return (
    <Container fluid className="mt-5">
      <Row>
        <Col md="6" className="offset-md-3 p-2">
          <Form onSubmit={handleSubmit}>
            <div className="text-center">
              {isUploading ? (
                <Spinner type="grow" color="primary" />
              ) : (
                <div>
                  <label htmlFor="imagepicker" className="">
                    <img src={downloadUrl} alt="" className="profile" />
                  </label>
                  <input
                    type="file"
                    name="image"
                    id="imagepicker"
                    accept="image/*"
                    multiple={false}
                    onChange={e => imagePicker(e)}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            <FormGroup>
              <Input
                type="text"
                name="name"
                id="name"
                placeholder="Name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email"
              />
            </FormGroup>
            <FormGroup>
              <Input
                type="number"
                name="number"
                id="phonenumber"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                placeholder="phone number"
              />
            </FormGroup>
            <FormGroup>
              <Input
                type="textarea"
                name="area"
                id="area"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="address"
              />
            </FormGroup>
            <FormGroup check>
              <Label check>
                <Input
                  type="checkbox"
                  onChange={() => {
                    setStar(!star);
                  }}
                  checked={star}
                />{" "}
                <span className="text-right">Mark as Star</span>
              </Label>
            </FormGroup>
            <Button
              type="submit"
              color="primary"
              block
              className="text-uppercase"
            >
              {isUpdate ? "Update Contact" : "Add Contact"}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default AddContact;
