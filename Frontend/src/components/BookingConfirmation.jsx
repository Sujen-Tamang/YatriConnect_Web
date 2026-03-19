const BookingConfirmation = ({
  bookingId, passenger, bus, seat, date, departure,
  price, paymentMethod, from, to, qrCodeUrl,
  onPrint, onDownload, onBookAnother
}) => {
  return (
    <div className="bg-[#1c2619] border border-[#2e3928] rounded-2xl overflow-hidden w-full max-w-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="bg-[#59f20d] p-6 text-[#0d140a] text-center">
        <div className="size-14 bg-[#0d140a]/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <span className="material-symbols-outlined text-3xl">check_circle</span>
        </div>
        <h1 className="text-2xl font-bold">Booking Confirmed!</h1>
        <p className="mt-1 text-[#0d140a]/70 text-sm">Your ticket has been successfully booked</p>
      </div>

      {/* Ticket Details */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="md:col-span-2">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#a6ba9c]">Booking ID:</span>
                <span className="font-medium text-white">{bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#a6ba9c]">Passenger:</span>
                <span className="font-medium text-white">{passenger}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#a6ba9c]">Bus:</span>
                <span className="font-medium text-white">{bus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#a6ba9c]">Seat(s):</span>
                <span className="font-medium text-[#59f20d]">{seat}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-[#2e3928]">
              <h3 className="font-semibold text-white mb-3">Journey Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#a6ba9c]">Date:</span>
                  <span className="font-medium text-white">{date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a6ba9c]">Departure:</span>
                  <span className="font-medium text-white">{departure}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a6ba9c]">Route:</span>
                  <span className="font-medium text-white">{from} → {to}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - QR Code */}
          <div className="flex flex-col items-center justify-center border-l border-[#2e3928] md:pl-6">
            <div className="bg-white p-2 rounded-lg">
              <img src={qrCodeUrl} alt="Booking QR Code" className="w-28 h-28" />
            </div>
            <p className="text-xs text-[#a6ba9c] mt-3 text-center">Scan this QR code at boarding</p>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="mt-6 pt-6 border-t border-[#2e3928]">
          <h3 className="font-semibold text-white mb-3">Payment Summary</h3>
          <div className="flex justify-between text-sm">
            <span className="text-[#a6ba9c]">Total Amount:</span>
            <span className="font-bold text-[#59f20d] text-lg">{price}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-[#a6ba9c]">Payment Method:</span>
            <span className="font-medium text-white">{paymentMethod}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <button
            onClick={onPrint}
            className="bg-[#59f20d] text-[#0d140a] px-6 py-2.5 rounded-lg font-bold hover:bg-[#4ed40b] shadow-[0_0_12px_rgba(89,242,13,0.2)] hover:shadow-[0_0_20px_rgba(89,242,13,0.4)] transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">print</span>
            Print Ticket
          </button>
          <button
            onClick={onDownload}
            className="bg-[#1c2619] border border-[#59f20d] text-[#59f20d] px-6 py-2.5 rounded-lg font-medium hover:bg-[#59f20d]/10 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            Download
          </button>
          <button
            onClick={onBookAnother}
            className="bg-[#0d140a] border border-[#2e3928] text-[#a6ba9c] px-6 py-2.5 rounded-lg font-medium hover:border-[#59f20d]/30 hover:text-white transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Book Another
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;