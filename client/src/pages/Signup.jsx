import React, { useState } from 'react';
import Textbox from '../components/Textbox';
import Button from '../components/Button';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Signup = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const password = watch("password", "");
  const confirmPassword = watch("confirmPassword", "");

  const [successMessage, setSuccessMessage] = useState(null); // State for success message

  const submitHandler = async (data) => {
    console.log("Submitted data:", data);
    try {
      const jsonData = JSON.stringify(data);
      const response = await axios.post('http://localhost:8800/register', jsonData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log("Response:", response);
      if (response && response.data) {
        console.log("Registration successful:", response.data);
        setSuccessMessage("Account successfully created!"); // Set success message
      } else {
        console.error('Unexpected response format:', response);
      }
    } catch (error) {
      console.error('Registration error:', error.response.data);
    }
  };

  return (
    <div className='h-screen flex justify-center items-center'>
      <form
        onSubmit={handleSubmit(submitHandler)}
        className='form-container w-full md:w-[400px] flex flex-col gap-y-8 bg-white px-10 pt-14 pb-14'
      >
        <div>
          <p className='text-blue-600 text-3xl font-bold text-center'>
            Welcome to 2Do!
          </p>
          <p className='text-center text-base text-gray-700'>
            Create your account below.
          </p>
          <p className='text-center text-base text-gray-700'>Made your account? <Link to="/login">Log in!</Link></p>
        </div>
        <div className='flex flex-col gap-y-5'>
          <Textbox
            placeholder='Use your imagination!'
            type='username'
            name='username'
            label='Username'
            className='w-full rounded-full'
            register={register("username", {
              required: "Username is required!",
            })}
            error={errors.username ? errors.username.message : ""}
          />
          <Textbox
            placeholder='email@example.com'
            type='email'
            name='email'
            label='Email Address'
            className='w-full rounded-full'
            register={register("email", {
              required: "Email Address is required!",
            })}
            error={errors.email ? errors.email.message : ""}
          />
          <Textbox
            placeholder='Your password'
            type='password'
            name='password'
            label='Password'
            className='w-full rounded-full'
            register={register("password", {
              required: "Password is required!",
            })}
            error={errors.password ? errors.password.message : ""}
          />
          <Textbox
            placeholder='Your password, again'
            type='password'
            name='confirmPassword'
            label='Confirm password'
            className='w-full rounded-full'
            register={register("confirmPassword", {
              required: "Confirm Password is required!",
              validate: (value) =>
                value === password || "Passwords do not match",
            })}
            error={errors.confirmPassword ? errors.confirmPassword.message : ""}
          />

          <Button
            type='submit'
            label='Submit'
            className='w-full h-10 bg-blue-700 text-white rounded-full'
          />
          
          {/* Display success message if account was successfully created */}
          {successMessage && (
            <p className="text-green-600 text-sm mt-2">{successMessage}</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default Signup;
