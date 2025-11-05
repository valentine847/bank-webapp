import React from "react";

export default function confirmationModal ({ open, onClose, onConfirm, message}) {
    if (!open) return null;

    return(
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <p className="mb-4 text-gray-700">{message}</p>
            <div className="flex justify-end gap-4">
                <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
               >
                cancel 
                </button>
                <button
                 onClick={onConfirm}
                 className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                 >
                    Ok
                 </button>
                 </div>
                 </div>
                 </div>
    );
}