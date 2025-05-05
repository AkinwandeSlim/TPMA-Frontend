import Link from 'next/link';
import Image from 'next/image';

type ILogoProps = {
  xl?: boolean;
};

const Logo = (props: ILogoProps) => {
  const size = props.xl ? '44' : '32';
  const fontStyle = props.xl ? 'text-3xl' : 'text-xl';

  return (
    <Link href="/">
      <span className="flex items-center space-x-2 font-extrabold text-gray-800">
        <Image src="/tpma-logos1.png" alt="Logo" width={size} height={size} />
        <span className={fontStyle}>
          <span className="text-yellow-500">SLUK-</span> {/* Updated to yellow-500 */}
          <span className="text-primary-500">TPMA</span>
        </span>
      </span>
    </Link>
  );
};

export { Logo };