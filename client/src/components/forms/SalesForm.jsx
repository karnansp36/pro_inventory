import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSale, getSales, updateSale } from '../../store/slices/salesSlice';
import { getUsersByRole } from '../../store/slices/usersSlice';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DollarSign, Wallet, Smartphone, CreditCard, Search, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const SalesForm = ({ onClose, branchOwnerId: propBranchOwnerId, saleToEdit }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { loading, error } = useSelector((state) => state.sales);
  const { usersByRole } = useSelector((state) => state.users);
  const { theme } = useTheme();

  const [branchOwners, setBranchOwners] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBranchOwners, setFilteredBranchOwners] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [amount, setAmount] = useState(saleToEdit ? saleToEdit.amount : '');
  const [paymentMethod, setPaymentMethod] = useState(saleToEdit ? saleToEdit.paymentMethod : 'cash');
  const [branchOwner, setBranchOwner] = useState(saleToEdit ? saleToEdit.branchOwner._id : (propBranchOwnerId || ''));
  const [selectedBranchOwnerName, setSelectedBranchOwnerName] = useState(saleToEdit ? saleToEdit.branchOwner.name : '');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // Load branch owners if Admin or BrandOwner
  useEffect(() => {
    if (user.role === 'Admin' || user.role === 'BrandOwner') {
      dispatch(getUsersByRole('BranchOwner'));
    }
  }, [dispatch, user.role]);

  useEffect(() => {
    if (usersByRole.BranchOwner) {
      setBranchOwners(usersByRole.BranchOwner);
      setFilteredBranchOwners(usersByRole.BranchOwner);
      if (propBranchOwnerId) {
        const initialBranchOwner = usersByRole.BranchOwner.find(bo => bo._id === propBranchOwnerId);
        if (initialBranchOwner) {
          setSelectedBranchOwnerName(initialBranchOwner.name);
        }
      }
    }
  }, [usersByRole.BranchOwner, propBranchOwnerId]);

  useEffect(() => {
    const filtered = branchOwners.filter((bo) =>
      bo.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBranchOwners(filtered);

    if (searchTerm && filtered.length === 1 && filtered[0].name.toLowerCase() === searchTerm.toLowerCase()) {
      setBranchOwner(filtered[0]._id);
      setSelectedBranchOwnerName(filtered[0].name);
      setShowDropdown(false);
    } else if (!searchTerm) {
      setBranchOwner('');
      setSelectedBranchOwnerName('');
    }
  }, [searchTerm, branchOwners]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (showDropdown && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [showDropdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || !paymentMethod || (user.role !== 'BranchOwner' && !branchOwner)) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const salesData = {
      amount: parseFloat(amount),
      paymentMethod,
      branchOwner: user.role === 'BranchOwner' ? user._id : branchOwner,
    };

    if (saleToEdit) {
      await dispatch(updateSale({ id: saleToEdit._id, saleData: salesData }));
    } else {
      await dispatch(createSale(salesData));
    }
    dispatch(getSales());
    onClose();
  };

  const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: Wallet },
    { value: 'gpay', label: 'GPay', icon: Smartphone },
    { value: 'card', label: 'Card', icon: CreditCard },
  ];

  // Theme-aware input base style
  const inputBase = `w-full pl-12 pr-4 py-3.5 rounded-xl border-2 font-medium transition-all duration-300 focus:ring-4 ${
    theme === 'dark'
      ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-400 focus:bg-slate-800 focus:border-blue-500 focus:ring-blue-500/30 hover:border-slate-600'
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-600 focus:ring-blue-100 hover:border-gray-300'
  }`;

  return (
    <div className="space-y-6">
      {/* Amount Input */}
      <div className="space-y-2">
        <label htmlFor="amount" className={`block text-sm font-semibold transition-colors duration-300 ${
          theme === 'dark' ? 'text-slate-200' : 'text-gray-800'
        }`}>
          Amount
        </label>
        <div className="relative group">
          <div className={`absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none transition-colors duration-300 ${
            theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
          }`}>
            <DollarSign className="h-5 w-5" />
          </div>
          <input
            type="number"
            id="amount"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className={inputBase}
            required
          />
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-3">
        <label className={`block text-sm font-semibold transition-colors duration-300 ${
          theme === 'dark' ? 'text-slate-200' : 'text-gray-800'
        }`}>
          Payment Method
        </label>
        <div className="grid grid-cols-3 gap-3">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = paymentMethod === method.value;
            return (
              <button
                key={method.value}
                type="button"
                onClick={() => setPaymentMethod(method.value)}
                className={`relative p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
                  isSelected
                    ? theme === 'dark'
                      ? 'bg-blue-600/30 border-blue-500 shadow-lg ring-2 ring-blue-500/30'
                      : 'bg-blue-50 border-blue-600 shadow-lg ring-2 ring-blue-200'
                    : theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 hover:border-blue-500 hover:bg-slate-800/70'
                    : 'bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                {isSelected && (
                  <div className={`absolute -top-2 -right-2 rounded-full p-0.5 ${
                    theme === 'dark' ? 'bg-slate-800' : 'bg-white'
                  }`}>
                    <CheckCircle2 className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-green-400' : 'text-green-600'
                    }`} />
                  </div>
                )}
                <div className="flex flex-col items-center space-y-2">
                  <Icon
                    className={`h-6 w-6 transition-colors duration-300 ${
                      isSelected 
                        ? theme === 'dark' ? 'text-blue-400' : 'text-blue-700'
                        : theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                    }`}
                  />
                  <span
                    className={`text-sm font-semibold transition-colors duration-300 ${
                      isSelected 
                        ? theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
                        : theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                    }`}
                  >
                    {method.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Branch Owner Selection */}
      {(user.role === 'Admin' || user.role === 'BrandOwner') && (
        <div className="space-y-2">
          <label htmlFor="branchOwner" className={`block text-sm font-semibold transition-colors duration-300 ${
            theme === 'dark' ? 'text-slate-200' : 'text-gray-800'
          }`}>
            Branch Owner
          </label>
          <div className="relative group" ref={dropdownRef}>
            <div className={`absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none transition-colors duration-300 ${
              theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
            }`}>
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              id="branchOwner"
              value={selectedBranchOwnerName || searchTerm}
              onChange={(e) => {
                const value = e.target.value;
                setSearchTerm(value);
                setShowDropdown(true);
                if (selectedBranchOwnerName && value !== selectedBranchOwnerName) {
                  setBranchOwner('');
                  setSelectedBranchOwnerName('');
                }
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => {
                setTimeout(() => {
                  setShowDropdown(false);
                  if (branchOwner && selectedBranchOwnerName) {
                    setSearchTerm(selectedBranchOwnerName);
                  } else {
                    setSearchTerm('');
                    setSelectedBranchOwnerName('');
                    setBranchOwner('');
                  }
                }, 100);
              }}
              placeholder="Search or select a Branch Owner"
              className={inputBase}
              required
            />
          </div>
        </div>
      )}

      {/* Branch Owner Dropdown Portal */}
      {showDropdown && filteredBranchOwners.length > 0 && (user.role === 'Admin' || user.role === 'BrandOwner') && (
        <ul
          className={`fixed z-[9999] rounded-xl shadow-2xl border-2 max-h-60 overflow-auto transition-colors duration-300 ${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-700'
              : 'bg-white border-gray-200'
          }`}
          style={{
            top: `${dropdownPosition.top + 8}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
          }}
        >
          {filteredBranchOwners.map((bo, index) => (
            <li
              key={bo._id}
              className={`px-4 py-3 cursor-pointer transition-all duration-300 border-b font-medium ${
                theme === 'dark'
                  ? 'border-slate-700 text-slate-200 hover:bg-blue-600 hover:text-white'
                  : 'border-gray-200 text-gray-800 hover:bg-blue-600 hover:text-white'
              } last:border-b-0 ${
                index === 0 ? 'rounded-t-xl' : ''
              } ${index === filteredBranchOwners.length - 1 ? 'rounded-b-xl' : ''}`}
              onMouseDown={() => {
                setBranchOwner(bo._id);
                setSelectedBranchOwnerName(bo.name);
                setSearchTerm(bo.name);
                setShowDropdown(false);
              }}
            >
              {bo.name}
            </li>
          ))}
        </ul>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        onClick={handleSubmit}
        className={`w-full px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-white ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600'
            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
        }`}
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {saleToEdit ? 'Updating Sale...' : 'Adding Sale...'}
          </span>
        ) : (
          saleToEdit ? 'Update Sale' : 'Add Sale'
        )}
      </button>
    </div>
  );
};

export default SalesForm;