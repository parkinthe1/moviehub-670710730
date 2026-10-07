import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  putVote,
  addToWishlist,
  removeFromWishlist
} from '../api/backend';

// แถบปุ่มใต้ชื่อหนัง: ให้คะแนน 1 ถึง 10 และปุ่มเพิ่มเข้า wishlist
function MovieActions({ movieId }) {
  const { isLoggedIn, token } = useAuth();

  const [myScore, setMyScore] = useState(null);
  const [inWishlist, setInWishlist] = useState(false);
  const [message, setMessage] = useState(null);

  // ถ้ายังไม่ได้ Login ให้แสดงปุ่มเข้าสู่ระบบ
  if (!isLoggedIn) {
    return (
      <p className="mt-4 text-sm text-slate-500">
        <Link
          to="/login"
          className="text-emerald-600 hover:underline"
        >
          เข้าสู่ระบบ
        </Link>{' '}
        เพื่อให้คะแนนและเพิ่มเข้ารายการที่อยากดู
      </p>
    );
  }

  // ให้คะแนนหนัง
  async function handleVote(score) {
    try {
      setMessage(null);

      // ต้องรอ Server สำเร็จก่อน
      await putVote(movieId, score, token);

      // Server สำเร็จแล้วค่อยเปลี่ยน state
      setMyScore(score);
      setMessage(`ให้คะแนน ${score}/10 เรียบร้อยแล้ว`);
    } catch (err) {
      // ถ้า Server error จะไม่เปลี่ยน myScore
      setMessage(err.message || 'ไม่สามารถให้คะแนนได้');
    }
  }

  // เพิ่ม / ลบ Wishlist
  async function handleWishlist() {
    try {
      setMessage(null);

      if (inWishlist) {
        // ลบออกจาก Wishlist ก่อน
        await removeFromWishlist(movieId, token);

        // Server สำเร็จแล้วค่อยเปลี่ยน state
        setInWishlist(false);
        setMessage('ลบออกจากรายการที่อยากดูแล้ว');
      } else {
        // เพิ่มเข้า Wishlist ก่อน
        await addToWishlist(movieId, token);

        // Server สำเร็จแล้วค่อยเปลี่ยน state
        setInWishlist(true);
        setMessage('เพิ่มเข้ารายการที่อยากดูแล้ว');
      }
    } catch (err) {
      // ถ้า Server error จะไม่เปลี่ยน state
      setMessage(
        err.message || 'ไม่สามารถแก้ไขรายการที่อยากดูได้'
      );
    }
  }

  return (
    <div className="mt-4 space-y-3">

      {/* คะแนน 1 - 10 */}
      <div className="flex flex-wrap items-center gap-1">
        <span className="mr-2 text-sm text-slate-500">
          ให้คะแนน
        </span>

        {Array.from(
          { length: 10 },
          (_, i) => i + 1
        ).map((n) => (
          <button
            key={n}
            onClick={() => handleVote(n)}
            className={
              'h-8 w-8 rounded-lg border text-sm ' +
              (
                myScore === n
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : 'border-emerald-200 bg-white text-slate-600 hover:bg-emerald-50'
              )
            }
          >
            {n}
          </button>
        ))}
      </div>

      {/* Wishlist */}
      <button
        onClick={handleWishlist}
        className={
          'rounded-lg border px-4 py-2 text-sm ' +
          (
            inWishlist
              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
              : 'border-emerald-200 bg-white text-slate-600 hover:bg-emerald-50'
          )
        }
      >
        {inWishlist
          ? '❤️ อยู่ในรายการที่อยากดูแล้ว'
          : '🤍 เพิ่มเข้ารายการที่อยากดู'}
      </button>

      {/* ข้อความสถานะ */}
      {message && (
        <p className="text-sm text-slate-500">
          {message}
        </p>
      )}
    </div>
  );
}

export default MovieActions;