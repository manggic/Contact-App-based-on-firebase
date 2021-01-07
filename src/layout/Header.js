//TODO: set NavbarBrand to go to home page and export Header

import React from "react";
import { Navbar, NavbarBrand, NavbarText } from "reactstrap";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <Navbar color="info" light>
      {/* <NavbarBrand className="text-white"><Link to="/" >LCO Contact App</Link></NavbarBrand> */}      
      <NavbarBrand tag={ Link } to="/" className="text-white">LCO Contact App</NavbarBrand>
      <NavbarText className="text-white">
        A simple Contact app
      </NavbarText>
    </Navbar>
  );
};

export default Header;

