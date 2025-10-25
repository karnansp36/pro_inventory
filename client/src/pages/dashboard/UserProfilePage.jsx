import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useTheme } from '../../context/ThemeContext';
import userService from '../../services/userService';
import { setCredentials } from '../../store/slices/authSlice';
import { Camera, X, Save, Loader, PlusCircle, MinusCircle, User } from 'lucide-react';

const UserProfilePage = () => {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);
  const { theme } = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState('');
  const [existingProfileImage, setExistingProfileImage] = useState('');

  // Shop Information
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [shopType, setShopType] = useState('');
  const [description, setDescription] = useState('');
  const [establishedYear, setEstablishedYear] = useState('');

  // Contact Information
  const [phoneNumbers, setPhoneNumbers] = useState(['']);
  const [emailAddress, setEmailAddress] = useState('');
  const [websiteLinks, setWebsiteLinks] = useState(['']);
  const [socialMediaLinks, setSocialMediaLinks] = useState(['']);
  const [messagingLinks, setMessagingLinks] = useState(['']);

  // Location & Address
  const [fullAddress, setFullAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [operatingArea, setOperatingArea] = useState('');
  const [deliveryArea, setDeliveryArea] = useState('');

  // Operating Details
  const [openingClosingTimes, setOpeningClosingTimes] = useState('');
  const [holidays, setHolidays] = useState('');
  const [availableServices, setAvailableServices] = useState(['']);

  // Products / Services Offered
  const [productCategories, setProductCategories] = useState(['']);
  const [productHighlights, setProductHighlights] = useState(['']);
  const [serviceDetails, setServiceDetails] = useState(['']);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
      setExistingProfileImage(currentUser.profileImage || '');

      // Shop Information
      setShopName(currentUser.shopName || '');
      setOwnerName(currentUser.ownerName || '');
      setShopType(currentUser.shopType || '');
      setDescription(currentUser.description || '');
      setEstablishedYear(currentUser.establishedYear || '');

      // Contact Information
      setPhoneNumbers(currentUser.phoneNumbers?.length > 0 ? currentUser.phoneNumbers : ['']);
      setEmailAddress(currentUser.emailAddress || '');
      setWebsiteLinks(currentUser.websiteLinks?.length > 0 ? currentUser.websiteLinks : ['']);
      setSocialMediaLinks(currentUser.socialMediaLinks?.length > 0 ? currentUser.socialMediaLinks : ['']);
      setMessagingLinks(currentUser.messagingLinks?.length > 0 ? currentUser.messagingLinks : ['']);

      // Location & Address
      setFullAddress(currentUser.fullAddress || '');
      setLandmark(currentUser.landmark || '');
      setGoogleMapsLink(currentUser.googleMapsLink || '');
      setOperatingArea(currentUser.operatingArea || '');
      setDeliveryArea(currentUser.deliveryArea || '');

      // Operating Details
      setOpeningClosingTimes(currentUser.openingClosingTimes || '');
      setHolidays(currentUser.holidays || '');
      setAvailableServices(currentUser.availableServices?.length > 0 ? currentUser.availableServices : ['']);

      // Products / Services Offered
      setProductCategories(currentUser.productCategories?.length > 0 ? currentUser.productCategories : ['']);
      setProductHighlights(currentUser.productHighlights?.length > 0 ? currentUser.productHighlights : ['']);
      setServiceDetails(currentUser.serviceDetails?.length > 0 ? currentUser.serviceDetails : ['']);
    }
  }, [currentUser]);

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
      setExistingProfileImage(''); // Clear existing image if a new one is selected
    }
  };

  const handleRemoveProfileImage = () => {
    setProfileImage(null);
    setProfileImagePreview('');
    setExistingProfileImage('');
  };

  const handleArrayInputChange = (setter, index, value) => {
    setter((prev) => {
      const newArray = [...prev];
      newArray[index] = value;
      return newArray;
    });
  };

  const handleAddArrayItem = (setter) => {
    setter((prev) => [...prev, '']);
  };

  const handleRemoveArrayItem = (setter, index) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      if (password) {
        formData.append('password', password);
      }
      if (profileImage) {
        formData.append('profileImage', profileImage);
      } else if (existingProfileImage === '') {
        formData.append('profileImage', ''); // Indicate removal of existing image
      }

      // Shop Information
      formData.append('shopName', shopName);
      formData.append('ownerName', ownerName);
      formData.append('shopType', shopType);
      formData.append('description', description);
      formData.append('establishedYear', establishedYear);

      // Contact Information
      phoneNumbers.forEach((num) => formData.append('phoneNumbers[]', num));
      formData.append('emailAddress', emailAddress);
      websiteLinks.forEach((link) => formData.append('websiteLinks[]', link));
      socialMediaLinks.forEach((link) => formData.append('socialMediaLinks[]', link));
      messagingLinks.forEach((link) => formData.append('messagingLinks[]', link));

      // Location & Address
      formData.append('fullAddress', fullAddress);
      formData.append('landmark', landmark);
      formData.append('googleMapsLink', googleMapsLink);
      formData.append('operatingArea', operatingArea);
      formData.append('deliveryArea', deliveryArea);

      // Operating Details
      formData.append('openingClosingTimes', openingClosingTimes);
      formData.append('holidays', holidays);
      availableServices.forEach((service) => formData.append('availableServices[]', service));

      // Products / Services Offered
      productCategories.forEach((category) => formData.append('productCategories[]', category));
      productHighlights.forEach((highlight) => formData.append('productHighlights[]', highlight));
      serviceDetails.forEach((detail) => formData.append('serviceDetails[]', detail));

      const res = await userService.updateUserProfile(formData);
      dispatch(setCredentials({ ...res }));
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full px-4 py-2 rounded-xl text-sm transition-all duration-300 outline-none ${
    theme === 'dark'
      ? 'bg-slate-800/50 border border-slate-700/50 text-slate-200 placeholder-slate-500 focus:bg-slate-800 focus:border-blue-500/50 focus:shadow-lg focus:shadow-blue-500/20'
      : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-500/50 focus:shadow-lg focus:shadow-blue-500/10'
  }`;

  const labelClass = `block text-sm font-medium mb-1 ${
    theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
  }`;

  const sectionTitleClass = `text-lg font-semibold mb-4 ${
    theme === 'dark' ? 'text-slate-100' : 'text-gray-800'
  }`;

  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-gray-100 text-gray-900'}`}>
      <h1 className={`text-3xl font-bold mb-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
        User Profile
      </h1>

      <form onSubmit={submitHandler} className="space-y-8">
        {/* Basic Information */}
        <div className={`p-6 rounded-2xl shadow-xl ${
          theme === 'dark'
            ? 'bg-slate-800 border border-slate-700'
            : 'bg-white border border-gray-200'
        }`}>
          <h2 className={sectionTitleClass}>Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className={labelClass}>Name</label>
              <input
                type="text"
                id="name"
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>Email Address</label>
              <input
                type="email"
                id="email"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className={labelClass}>Password</label>
              <input
                type="password"
                id="password"
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className={labelClass}>Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                className={inputClass}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Profile Image</label>
              <div className="flex items-center space-x-4">
                <div className={`relative w-24 h-24 rounded-full flex items-center justify-center overflow-hidden ${
                  theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'
                }`}>
                  {(profileImagePreview || existingProfileImage) ? (
                    <img
                      src={profileImagePreview || existingProfileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className={`h-12 w-12 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`} />
                  )}
                  <input
                    type="file"
                    id="profileImage"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleProfileImageChange}
                    accept="image/*"
                  />
                  <label
                    htmlFor="profileImage"
                    className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer ${
                      theme === 'dark' ? 'hover:bg-opacity-70' : 'hover:bg-opacity-60'
                    }`}
                  >
                    <Camera className="h-6 w-6" />
                  </label>
                </div>
                {(profileImagePreview || existingProfileImage) && (
                  <button
                    type="button"
                    onClick={handleRemoveProfileImage}
                    className={`p-2 rounded-full ${
                      theme === 'dark'
                        ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                    } transition-colors duration-200`}
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Shop Information (Only for BranchOwner role) */}
        {currentUser?.role === 'BranchOwner' && (
          <div className={`p-6 rounded-2xl shadow-xl ${
            theme === 'dark'
              ? 'bg-slate-800 border border-slate-700'
              : 'bg-white border border-gray-200'
          }`}>
            <h2 className={sectionTitleClass}>Shop Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="shopName" className={labelClass}>Shop Name</label>
                <input
                  type="text"
                  id="shopName"
                  className={inputClass}
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="ownerName" className={labelClass}>Owner Name / Contact Person</label>
                <input
                  type="text"
                  id="ownerName"
                  className={inputClass}
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="shopType" className={labelClass}>Shop Type / Category</label>
                <input
                  type="text"
                  id="shopType"
                  className={inputClass}
                  value={shopType}
                  onChange={(e) => setShopType(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="establishedYear" className={labelClass}>Established Year</label>
                <input
                  type="number"
                  id="establishedYear"
                  className={inputClass}
                  value={establishedYear}
                  onChange={(e) => setEstablishedYear(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="description" className={labelClass}>Description / About</label>
                <textarea
                  id="description"
                  className={`${inputClass} min-h-[80px]`}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>
            </div>
          </div>
        )}

        {/* Contact Information (Only for BranchOwner role) */}
        {currentUser?.role === 'BranchOwner' && (
          <div className={`p-6 rounded-2xl shadow-xl ${
            theme === 'dark'
              ? 'bg-slate-800 border border-slate-700'
              : 'bg-white border border-gray-200'
          }`}>
            <h2 className={sectionTitleClass}>Contact Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="emailAddress" className={labelClass}>Official Email Address</label>
                <input
                  type="email"
                  id="emailAddress"
                  className={inputClass}
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass}>Phone Number(s)</label>
                {phoneNumbers.map((number, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      className={inputClass}
                      value={number}
                      onChange={(e) => handleArrayInputChange(setPhoneNumbers, index, e.target.value)}
                    />
                    {phoneNumbers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveArrayItem(setPhoneNumbers, index)}
                        className={`p-2 rounded-full ${
                          theme === 'dark'
                            ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        } transition-colors duration-200`}
                      >
                        <MinusCircle className="h-5 w-5" />
                      </button>
                    )}
                    {index === phoneNumbers.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleAddArrayItem(setPhoneNumbers)}
                        className={`p-2 rounded-full ${
                          theme === 'dark'
                            ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        } transition-colors duration-200`}
                      >
                        <PlusCircle className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className={labelClass}>Website Links</label>
                {websiteLinks.map((link, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="url"
                      className={inputClass}
                      value={link}
                      onChange={(e) => handleArrayInputChange(setWebsiteLinks, index, e.target.value)}
                    />
                    {websiteLinks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveArrayItem(setWebsiteLinks, index)}
                        className={`p-2 rounded-full ${
                          theme === 'dark'
                            ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        } transition-colors duration-200`}
                      >
                        <MinusCircle className="h-5 w-5" />
                      </button>
                    )}
                    {index === websiteLinks.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleAddArrayItem(setWebsiteLinks)}
                        className={`p-2 rounded-full ${
                          theme === 'dark'
                            ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        } transition-colors duration-200`}
                      >
                        <PlusCircle className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className={labelClass}>Social Media Links (Instagram, Facebook, etc.)</label>
                {socialMediaLinks.map((link, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="url"
                      className={inputClass}
                      value={link}
                      onChange={(e) => handleArrayInputChange(setSocialMediaLinks, index, e.target.value)}
                    />
                    {socialMediaLinks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveArrayItem(setSocialMediaLinks, index)}
                        className={`p-2 rounded-full ${
                          theme === 'dark'
                            ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        } transition-colors duration-200`}
                      >
                        <MinusCircle className="h-5 w-5" />
                      </button>
                    )}
                    {index === socialMediaLinks.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleAddArrayItem(setSocialMediaLinks)}
                        className={`p-2 rounded-full ${
                          theme === 'dark'
                            ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        } transition-colors duration-200`}
                      >
                        <PlusCircle className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className={labelClass}>Messaging Links (WhatsApp, Telegram, etc.)</label>
                {messagingLinks.map((link, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="url"
                      className={inputClass}
                      value={link}
                      onChange={(e) => handleArrayInputChange(setMessagingLinks, index, e.target.value)}
                    />
                    {messagingLinks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveArrayItem(setMessagingLinks, index)}
                        className={`p-2 rounded-full ${
                          theme === 'dark'
                            ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        } transition-colors duration-200`}
                      >
                        <MinusCircle className="h-5 w-5" />
                      </button>
                    )}
                    {index === messagingLinks.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleAddArrayItem(setMessagingLinks)}
                        className={`p-2 rounded-full ${
                          theme === 'dark'
                            ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        } transition-colors duration-200`}
                      >
                        <PlusCircle className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Location & Address (Only for BranchOwner role) */}
        {currentUser?.role === 'BranchOwner' && (
          <div className={`p-6 rounded-2xl shadow-xl ${
            theme === 'dark'
              ? 'bg-slate-800 border border-slate-700'
              : 'bg-white border border-gray-200'
          }`}>
            <h2 className={sectionTitleClass}>Location & Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="fullAddress" className={labelClass}>Full Address</label>
                <textarea
                  id="fullAddress"
                  className={`${inputClass} min-h-[80px]`}
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                ></textarea>
              </div>
              <div>
                <label htmlFor="landmark" className={labelClass}>Landmark</label>
                <input
                  type="text"
                  id="landmark"
                  className={inputClass}
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="googleMapsLink" className={labelClass}>Google Maps Link or Embedded Map</label>
                <input
                  type="url"
                  id="googleMapsLink"
                  className={inputClass}
                  value={googleMapsLink}
                  onChange={(e) => setGoogleMapsLink(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="operatingArea" className={labelClass}>Operating Area</label>
                <input
                  type="text"
                  id="operatingArea"
                  className={inputClass}
                  value={operatingArea}
                  onChange={(e) => setOperatingArea(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="deliveryArea" className={labelClass}>Delivery Area</label>
                <input
                  type="text"
                  id="deliveryArea"
                  className={inputClass}
                  value={deliveryArea}
                  onChange={(e) => setDeliveryArea(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Operating Details (Only for BranchOwner role) */}
        {currentUser?.role === 'BranchOwner' && (
          <div className={`p-6 rounded-2xl shadow-xl ${
            theme === 'dark'
              ? 'bg-slate-800 border border-slate-700'
              : 'bg-white border border-gray-200'
          }`}>
            <h2 className={sectionTitleClass}>Operating Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="openingClosingTimes" className={labelClass}>Opening & Closing Times</label>
                <input
                  type="text"
                  id="openingClosingTimes"
                  className={inputClass}
                  value={openingClosingTimes}
                  onChange={(e) => setOpeningClosingTimes(e.target.value)}
                  placeholder="e.g., Mon-Sat 9 AM - 9 PM"
                />
              </div>
              <div>
                <label htmlFor="holidays" className={labelClass}>Holidays / Special Closures</label>
                <input
                  type="text"
                  id="holidays"
                  className={inputClass}
                  value={holidays}
                  onChange={(e) => setHolidays(e.target.value)}
                  placeholder="e.g., Sundays, Public Holidays"
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Available Services</label>
                {availableServices.map((service, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      className={inputClass}
                      value={service}
                      onChange={(e) => handleArrayInputChange(setAvailableServices, index, e.target.value)}
                    />
                    {availableServices.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveArrayItem(setAvailableServices, index)}
                        className={`p-2 rounded-full ${
                          theme === 'dark'
                            ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        } transition-colors duration-200`}
                      >
                        <MinusCircle className="h-5 w-5" />
                      </button>
                    )}
                    {index === availableServices.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleAddArrayItem(setAvailableServices)}
                        className={`p-2 rounded-full ${
                          theme === 'dark'
                            ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        } transition-colors duration-200`}
                      >
                        <PlusCircle className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Products / Services Offered (Only for BranchOwner role) */}
        {currentUser?.role === 'BranchOwner' && (
          <div className={`p-6 rounded-2xl shadow-xl ${
            theme === 'dark'
              ? 'bg-slate-800 border border-slate-700'
              : 'bg-white border border-gray-200'
          }`}>
            <h2 className={sectionTitleClass}>Products / Services Offered</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Product Categories</label>
                {productCategories.map((category, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      className={inputClass}
                      value={category}
                      onChange={(e) => handleArrayInputChange(setProductCategories, index, e.target.value)}
                    />
                    {productCategories.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveArrayItem(setProductCategories, index)}
                        className={`p-2 rounded-full ${
                          theme === 'dark'
                            ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        } transition-colors duration-200`}
                      >
                        <MinusCircle className="h-5 w-5" />
                      </button>
                    )}
                    {index === productCategories.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleAddArrayItem(setProductCategories)}
                        className={`p-2 rounded-full ${
                          theme === 'dark'
                            ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        } transition-colors duration-200`}
                      >
                        <PlusCircle className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className={labelClass}>Product Highlights (Featured items, best sellers)</label>
                {productHighlights.map((highlight, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      className={inputClass}
                      value={highlight}
                      onChange={(e) => handleArrayInputChange(setProductHighlights, index, e.target.value)}
                    />
                    {productHighlights.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveArrayItem(setProductHighlights, index)}
                        className={`p-2 rounded-full ${
                          theme === 'dark'
                            ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        } transition-colors duration-200`}
                      >
                        <MinusCircle className="h-5 w-5" />
                      </button>
                    )}
                    {index === productHighlights.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleAddArrayItem(setProductHighlights)}
                        className={`p-2 rounded-full ${
                          theme === 'dark'
                            ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        } transition-colors duration-200`}
                      >
                        <PlusCircle className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className={labelClass}>Service Details (Repair, customization, consultations)</label>
                {serviceDetails.map((detail, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      className={inputClass}
                      value={detail}
                      onChange={(e) => handleArrayInputChange(setServiceDetails, index, e.target.value)}
                    />
                    {serviceDetails.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveArrayItem(setServiceDetails, index)}
                        className={`p-2 rounded-full ${
                          theme === 'dark'
                            ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        } transition-colors duration-200`}
                      >
                        <MinusCircle className="h-5 w-5" />
                      </button>
                    )}
                    {index === serviceDetails.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleAddArrayItem(setServiceDetails)}
                        className={`p-2 rounded-full ${
                          theme === 'dark'
                            ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        } transition-colors duration-200`}
                      >
                        <PlusCircle className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-xl text-lg font-semibold transition-all duration-300 ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : theme === 'dark'
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 active:scale-98'
              : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30 active:scale-98'
          }`}
        >
          {loading ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              <span>Updating...</span>
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              <span>Update Profile</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default UserProfilePage;