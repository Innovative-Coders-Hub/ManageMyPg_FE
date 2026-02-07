import React, { useState } from 'react';
import dayjs from 'dayjs';

export default function VacateSection({ current, setBed, showSnack }) {
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(() => {
    // If no end, default to one month from today
    if (!current?.end) return dayjs().add(1, 'month').format('YYYY-MM-DD');
    return dayjs(current.end).format('YYYY-MM-DD');
  });

  const handleUpdate = () => {
    if (!date || !dayjs(date).isValid()) {
      showSnack('Please select a valid date', 'error');
      return;
    }
    setBed(prev => {
      if (!prev?.tenant) return prev;
      return {
        ...prev,
        tenant: {
          ...prev.tenant,
          end: dayjs(date).endOf('day').toISOString(),
        },
      };
    });
    setEditing(false);
    showSnack('Vacating date updated', 'success');
  };

  const handleExtend = () => {
    // Extend by 1 month from current end or today
    const base = current?.end ? dayjs(current.end) : dayjs();
    const newDate = base.add(1, 'month').format('YYYY-MM-DD');
    setDate(newDate);
    setEditing(true);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
      <div className="flex items-center gap-2">
        <span className="font-medium text-gray-700">Vacating Date:</span>
        {editing ? (
          <input
            type="date"
            className="px-2 py-1 rounded border"
            value={date}
            min={dayjs().add(1, 'day').format('YYYY-MM-DD')}
            onChange={e => setDate(e.target.value)}
          />
        ) : (
          <span className="text-gray-900">{current?.end ? dayjs(current.end).format('DD MMM YYYY') : 'Not set'}</span>
        )}
      </div>
      <div className="flex gap-2">
        {!editing && (
          <button
            className="px-3 py-1 rounded bg-amber-100 text-amber-800 border border-amber-300 text-sm"
            onClick={() => setEditing(true)}
          >{current?.end ? 'Update' : 'Set'} Vacating Date</button>
        )}
        {editing && (
          <button
            className="px-3 py-1 rounded bg-indigo-600 text-white text-sm"
            onClick={handleUpdate}
          >Save</button>
        )}
        <button
          className="px-3 py-1 rounded bg-green-100 text-green-800 border border-green-300 text-sm"
          onClick={handleExtend}
        >Extend by 1 Month</button>
      </div>
    </div>
  );
}