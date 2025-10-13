import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSale, getSales, updateSale } from '../../store/slices/salesSlice';
import { getUsersByRole } from '../../store/slices/usersSlice';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DollarSign, Wallet, Smartphone, CreditCard, Search, CheckCircle2 } from 'lucide-react';

const SalesForm = ({ onClose, branchOwnerId: propBranchOwnerId, saleToEdit }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { loading, error } = useSelector((state) => state.sales);
  const { usersByRole } = useSelector((state) => state.users);

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

    // Auto-select if there's a single exact match and the search term is not empty
    if (searchTerm && filtered.length === 1 && filtered[0].name.toLowerCase() === searchTerm.toLowerCase()) {
      setBranchOwner(filtered[0]._id);
      setSelectedBranchOwnerName(filtered[0].name);
      setShowDropdown(false);
    } else if (!searchTerm) {
      // If search term is cleared, clear selection
      setBranchOwner('');
      setSelectedBranchOwnerName('');
    }
  }, [searchTerm, branchOwners]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
      // Update existing sale
      await dispatch(updateSale({ id: saleToEdit._id, saleData: salesData }));
    } else {
      // Create new sale
      await dispatch(createSale(salesData));
    }
    dispatch(getSales());
    onClose();
  };

  const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: Wallet, color: 'green' },
    { value: 'gpay', label: 'GPay', icon: Smartphone, color: 'blue' },
    { value: 'card', label: 'Card', icon: CreditCard, color: 'purple' }
  ];

  return (
    <div className="space-y-6">
      {/* Amount Input */}
      <div className="space-y-2">
        <label 
          htmlFor="amount" 
          className="block text-sm font-semibold text-gray-700 dark:text-slate-300"
        >
          Amount
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 dark:text-slate-500">
            <DollarSign className="h-5 w-5" />
          </div>
          <input
            type="number"
            id="amount"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 font-medium transition-all duration-200 focus:ring-2 focus:ring-offset-2 bg-white dark:bg-slate-800/50 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-offset-white dark:focus:ring-offset-slate-900"
            required
          />
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">
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
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/10 dark:shadow-blue-500/20'
                    : 'bg-white dark:bg-slate-800/30 border-gray-300 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-600'
                }`}
              >
                {isSelected && (
                  <div className="absolute -top-2 -right-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                )}
                <div className="flex flex-col items-center space-y-2">
                  <Icon 
                    className={`h-6 w-6 ${
                      isSelected
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-400 dark:text-slate-500'
                    }`} 
                  />
                  <span 
                    className={`text-sm font-semibold ${
                      isSelected
                        ? 'text-gray-900 dark:text-slate-100'
                        : 'text-gray-600 dark:text-slate-400'
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
          <label 
            htmlFor="branchOwner" 
            className="block text-sm font-semibold text-gray-700 dark:text-slate-300"
          >
            Branch Owner
          </label>
          <div className="relative" ref={dropdownRef}>
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 dark:text-slate-500">
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
                // Clear selection if typing starts after a selection was made
                if (selectedBranchOwnerName && value !== selectedBranchOwnerName) {
                  setBranchOwner('');
                  setSelectedBranchOwnerName('');
                }
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => {
                // Delay hiding dropdown to allow click on dropdown items
                setTimeout(() => {
                  setShowDropdown(false);
                  // If a branch owner is selected, ensure the input displays its name
                  if (branchOwner && selectedBranchOwnerName) {
                    setSearchTerm(selectedBranchOwnerName);
                  } else {
                    // If no branch owner is selected, clear the search term and selection
                    setSearchTerm('');
                    setSelectedBranchOwnerName('');
                    setBranchOwner('');
                  }
                }, 100);
              }}
              placeholder="Search or select a Branch Owner"
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 font-medium transition-all duration-200 focus:ring-2 focus:ring-offset-2 bg-white dark:bg-slate-800/50 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-offset-white dark:focus:ring-offset-slate-900"
              required
            />
          </div>
        </div>
      )}

      {/* Branch Owner Dropdown Portal */}
      {showDropdown && filteredBranchOwners.length > 0 && (user.role === 'Admin' || user.role === 'BrandOwner') && (
        <ul 
          className="fixed z-[9999] rounded-xl shadow-2xl border-2 max-h-60 overflow-auto bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
          style={{
            top: `${dropdownPosition.top + 8}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`
          }}
        >
          {filteredBranchOwners.map((bo) => (
            <li
              key={bo._id}
              className="px-4 py-3 cursor-pointer transition-all duration-150 first:rounded-t-xl last:rounded-b-xl hover:bg-blue-600 text-gray-900 dark:text-slate-200 hover:text-white"
              onMouseDown={() => { // Changed onClick to onMouseDown
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
        className="w-full px-6 py-3.5 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600 text-white"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4" 
                fill="none" 
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
              />
            </svg>
            Adding Sale...
          </span>
        ) : (
          saleToEdit ? 'Update Sale' : 'Add Sale'
        )}
      </button>
    </div>
  );
};

export default SalesForm;