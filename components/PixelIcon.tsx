import React from 'react';

/*
 * Pixel icons for the site's chrome (nav, Start menu, taskbar, desktop icons): drawn on a 24 x 24
 * pixel grid to match the pixel lettering and the retro desktop. Path data from pixelarticons
 * v2.4.2 by Gerrit Halfmann (https://github.com/halfmage/pixelarticons); its MIT licence is kept
 * as a legal comment (below) so the build keeps it too.
 *
 * They take the same props as the lucide icons they replace (size, className, style); strokeWidth
 * is ignored. They are sharpest at multiples of 12px.
 */

export type PixelIconProps = Omit<React.SVGProps<SVGSVGElement>, 'ref'> & { size?: number | string; strokeWidth?: number | string };
export type PixelIcon = React.FC<PixelIconProps>;

/*! @license pixelarticons v2.4.2 (https://github.com/halfmage/pixelarticons)
 * MIT License
 *
 * Copyright (c) 2019 Gerrit Halfmann
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
function pixel(name: string, paths: string[]): PixelIcon {
  const Icon: PixelIcon = ({ size = 24, strokeWidth: _sw, ...rest }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor"
      shapeRendering="crispEdges" aria-hidden="true" focusable="false" {...rest}>
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
  Icon.displayName = `Pixel${name}`;
  return Icon;
}

export const PxShoppingBag = pixel('ShoppingBag', ['M3 6h18v2H3zm2 14h14v2H5zM3 8h2v12H3zm16 0h2v12h-2z', 'M7 4h2v6H7zm2-2h6v2H9zm6 2h2v6h-2z']); // shopping-bag
export const PxSparkles = pixel('Sparkles', ['M11 1h2v4h-2zm0 22h2v-4h-2zM9 5h2v4H9zm0 14h2v-4H9zm4-14h2v4h-2zm0 14h2v-4h-2zM5 9h4v2H5zm14 0h-4v2h4zM1 11h4v2H1zm22 0h-4v2h4zM5 13h4v2H5zm14 0h-4v2h4zm0-12h2v6h-2z', 'M17 3h6v2h-6zM3 17h2v2H3zm-2 2h2v2H1zm2 2h2v2H3zm2-2h2v2H5z']); // sparkles
export const PxBriefcase = pixel('Briefcase', ['M2 8h2v12H2zm18 0h2v12h-2zM4 6h16v2H4zm0 14h16v2H4zM8 4h2v2H8zm2-2h4v2h-4zm4 2h2v2h-2z']); // briefcase
export const PxLabel = pixel('Label', ['M16 22h-4v-2h4v2Zm-4-2h-2v-2h2v2Zm6 0h-2v-2h2v2Zm-8-2H8v-2h2v2Zm10 0h-2v-2h2v2ZM8 16H6v-2h2v2Zm14 0h-2v-4h2v4ZM6 14H4v-2h2v2Zm-2-2H2V4h2v8Zm16 0h-2v-2h2v2Zm-2-2h-2V8h2v2ZM8 8H6V6h2v2Zm8 0h-2V6h2v2Zm-2-2h-2V4h2v2Zm-2-2H4V2h8v2Z']); // label
export const PxUserPlus = pixel('UserPlus', ['M9 2h6v2H9zm0 8h6v2H9zm6-6h2v6h-2zM7 4h2v6H7zM4 18h2v4H4zm14 0h2v4h-2zM8 14h8v2H8zm-2 2h2v2H6z', 'M18 16h2v6h-2z', 'M16 18h6v2h-6z']); // user-plus
export const PxBookOpen = pixel('BookOpen', ['M2 3h9v2H2zM0 19h11v2H0zM13 3h9v2h-9zm0 16h11v2H13zM11 5h2v18h-2zM0 5h2v14H0zm22 0h2v14h-2zm-7 2h5v2h-5zm0 4h5v2h-5zm0 4h2v2h-2z']); // book-open
export const PxUsers = pixel('Users', ['M5 2h6v2H5zm10 0h4v2h-4zM5 10h6v2H5zm10 0h4v2h-4zm4-6h2v6h-2zm-8 0h2v6h-2zM3 4h2v6H3zM0 18h2v4H0zm14 0h2v4h-2zm8 0h2v4h-2zM4 14h8v2H4zm12 0h4v2h-4zM2 16h2v2H2zm10 0h2v2h-2zm8 0h2v2h-2z']); // users
export const PxGift = pixel('Gift', ['M4 6h16v2H4zM2 8h2v4H2zm2 4h16v2H4zm16-4h2v4h-2zM6 4h2v2H6zm2-2h3v2H8zm3 2h2v2h-2zm2-2h3v2h-3zm3 2h2v2h-2zM4 14h2v6H4zm2 6h12v2H6zm12-6h2v6h-2zm-7-6h2v4h-2zm0 6h2v6h-2z']); // gift
export const PxMail = pixel('Mail', ['M6 8h2v2H6zm2 2h2v2H8zm10-2h-2v2h2zm-2 2h-2v2h2zm-6 2h4v2h-4zM2 6h2v12H2zm18 0h2v12h-2zM4 4h16v2H4zm0 14h16v2H4z']); // mail
export const PxInfoBox = pixel('InfoBox', ['M4 2h16v2H4zm0 18h16v2H4zM2 4h2v16H2zm18 0h2v16h-2zm-9 5h2V7h-2zm0 8h2v-6h-2z']); // info-box
export const PxFolder = pixel('Folder', ['M4 4h6v2H4zm0 14h16v2H4zM20 8h2v10h-2zM2 6h2v12H2zm8 0h10v2H10z']); // folder
export const PxCpu = pixel('Cpu', ['M5 3h14v2H5zm0 16h14v2H5zM3 5h2v14H3zm16 0h2v14h-2zM9 7h6v2H9zm0 8h6v2H9zM7 9h2v6H7zm8 0h2v6h-2zm-4-8h2v2h-2zm0 20h2v2h-2zM1 11h2v2H1zm20 0h2v2h-2zm0-4h2v2h-2zm0 8h2v2h-2zM1 15h2v2H1zm0-8h2v2H1zm6-6h2v2H7zm8 0h2v2h-2zm0 20h2v2h-2zm-8 0h2v2H7z']); // cpu
export const PxChevronDown = pixel('ChevronDown', ['M13 16h-2v-2h2v2Zm-2-2H9v-2h2v2Zm4 0h-2v-2h2v2Zm-6-2H7v-2h2v2Zm8 0h-2v-2h2v2ZM7 10H5V8h2v2Zm12 0h-2V8h2v2Z']); // chevron-down
export const PxChevronUp = pixel('ChevronUp', ['M13 8h-2v2h2V8Zm-2 2H9v2h2v-2Zm4 0h-2v2h2v-2Zm-6 2H7v2h2v-2Zm8 0h-2v2h2v-2ZM7 14H5v2h2v-2Zm12 0h-2v2h2v-2Z']); // chevron-up
export const PxChevronRight = pixel('ChevronRight', ['M16 13v-2h-2v2h2Zm-2-2V9h-2v2h2Zm0 4v-2h-2v2h2Zm-2-6V7h-2v2h2Zm0 8v-2h-2v2h2ZM10 7V5H8v2h2Zm0 12v-2H8v2h2Z']); // chevron-right
export const PxUser = pixel('User', ['M9 2h6v2H9zm0 8h6v2H9zm6-6h2v6h-2zM7 4h2v6H7zM4 18h2v4H4zm14 0h2v4h-2zM8 14h8v2H8zm-2 2h2v2H6zm10 0h2v2h-2z']); // user
export const PxMessage = pixel('Message', ['M20 2H4v2h16zm0 14H6v2h14zm2-12h-2v12h2zM4 4H2v18h2zm2 14H4v2h2z']); // message
export const PxFileText = pixel('FileText', ['M6 4H4v16h2zm10-2H6v2h10zm4 4h-2v14h2zm-2 14H6v2h12zM16 4h2v2h-2zm-4 0h2v6h-2z', 'M12 8h6v2h-6zm-4 8h8v2H8zm0-4h8v2H8zm0-4h2v2H8z']); // file-text
export const PxLogout = pixel('Logout', ['M8 11h12v2H8zm8-2h2v2h-2z', 'M14 7h2v10h-2zm2 6h2v2h-2zM6 2h12v2H6zm0 18h12v2H6zM4 4h2v16H4zm14 0h2v3h-2zm0 13h2v3h-2z']); // logout
export const PxPower = pixel('Power', ['M6 20h12v2H6zM18 6h2v2h-2zM4 6h2v2H4zm2-2h2v2H6zm10 0h2v2h-2zM4 18h2v2H4zm14 0h2v2h-2zM2 8h2v10H2zm18 0h2v10h-2zm-9-6h2v9h-2z']); // power
export const PxClose = pixel('Close', ['M7 19H5V17H7V19ZM19 19H17V17H19V19ZM9 15V17H7V15H9ZM17 17H15V15H17V17ZM11 15H9V13H11V15ZM15 15H13V13H15V15ZM13 13H11V11H13V13ZM11 11H9V9H11V11ZM15 11H13V9H15V11ZM9 9H7V7H9V9ZM17 9H15V7H17V9ZM7 7H5V5H7V7ZM19 7H17V5H19V7Z']); // close
export const PxMenu = pixel('Menu', ['M20 18H4v-2h16v2Zm0-5H4v-2h16v2Zm0-5H4V6h16v2Z']); // menu
export const PxBell = pixel('Bell', ['M9 2h6v2H9zM7 4h2v2H7zm8 0h2v2h-2zM5 6h2v7H5zm12 0h2v7h-2zM3 13h2v4H3zm16 0h2v4h-2z', 'M3 15h18v2H3zm5 3h2v2H8zm6 0h2v2h-2zm-4 2h4v2h-4z']); // bell
export const PxGlobe = pixel('Globe', ['M6 2h12v2H6zm0 18h12v2H6zM4 4h2v2H4zm5 0h2v2H9zm0 14h2v2H9zm4 0h2v2h-2zM7 6h2v12H7zm8 0h2v12h-2zm-2-2h2v2h-2zm7 0h-2v2h2zM2 6h2v12H2zm20 0h-2v12h2zM4 18h2v2H4zm16 0h-2v2h2z', 'M3 11h18v2H3z']); // globe
export const PxCheck = pixel('Check', ['M10 18H8v-2h2v2Zm-2-2H6v-2h2v2Zm4-2v2h-2v-2h2Zm-6 0H4v-2h2v2Zm8 0h-2v-2h2v2Zm2-2h-2v-2h2v2Zm2-2h-2V8h2v2Zm2-2h-2V6h2v2Z']); // check
export const PxCalendar = pixel('Calendar', ['M5 4h14v2H5zm0 16h14v2H5zM3 10h2v10H3zm0-4h2v2H3zm16 0h2v2h-2zm0 4h2v10h-2zM3 8h18v2H3zm12-6h2v2h-2zM7 2h2v2H7z']); // calendar
export const PxStar = pixel('Star', ['M5 20H8V22H3V16H5V20ZM21 22H16V20H19V16H21V22ZM10 20H8V18H10V20ZM16 20H14V18H16V20ZM14 18H10V16H14V18ZM7 16H5V13H7V16ZM19 16H17V13H19V16ZM5 13H3V11H5V13ZM21 13H19V11H21V13ZM9 9H3V11H1V7H9V9ZM23 11H21V9H15V7H23V11ZM11 7H9V3H11V7ZM15 7H13V3H15V7ZM13 3H11V1H13V3Z']); // star
export const PxHome = pixel('Home', ['M4 20h16v2H4zm16-10h2v10h-2zM2 10h2v10H2zm2-2h2v2H4zm2-2h2v2H6zm2-2h2v2H8zm2-2h4v2h-4zm4 2h2v2h-2zm2 2h2v2h-2zm2 2h2v2h-2zM8 14h2v6H8zm2-2h4v2h-4zm4 2h2v6h-2z']); // home
export const PxEuro = pixel('Euro', ['M19 20H9v-2h10v2ZM9 9h7v2H9v2h7v2H9v3H7v-3H5v-2h2v-2H5V9h2V6h2v3Zm10-3H9V4h10v2Z']); // euro
export const PxMinus = pixel('Minus', ['M4 11h16v2H4z']); // minus
export const PxVolume = pixel('Volume', ['M13 22h-2v-2H9v-2h2V6H9V4h2V2h2v20Zm-4-4H7v-2h2v2Zm10 0h-4v-2h4v2ZM7 10H5v4h2v2H3V8h4v2Zm14 6h-2V8h2v8Zm-4-2h-2v-4h2v4ZM9 8H7V6h2v2Zm10 0h-4V6h4v2Z']); // volume-2
export const PxKeyboard = pixel('Keyboard', ['M21 21H3v-2h18v2ZM3 19H1V5h2v14Zm20 0h-2V5h2v14Zm-5-2H6v-2h12v2Zm-9-4H7v-2h2v2Zm4 0h-2v-2h2v2Zm4 0h-2v-2h2v2ZM7 9H5V7h2v2Zm4 0H9V7h2v2Zm4 0h-2V7h2v2Zm4 0h-2V7h2v2Zm2-4H3V3h18v2Z']); // keyboard
export const PxClock = pixel('Clock', ['M6 2h12v2H6zM2 6h2v12H2zm18 0h2v12h-2zm-2-2h2v2h-2zM4 4h2v2H4zm2 18h12v-2H6zm12-2h2v-2h-2zM4 20h2v-2H4zm7-14h2v7h-2zm2 7h2v2h-2zm2 2h2v2h-2z']); // clock
export const PxListBox = pixel('ListBox', ['M4 2h16v2H4zm2 5h2v2H6zm4 0h8v2h-8zm-4 4h2v2H6zm4 0h8v2h-8zm-4 4h2v2H6zm4 0h8v2h-8zm-6 5h16v2H4zM2 4h2v16H2zm18 0h2v16h-2z']); // list-box
export const PxSave = pixel('Save', ['M20 22H4V20H6V14H8V20H16V14H18V20H20V22ZM4 20H2V4H4V20ZM22 20H20V6H22V20ZM16 14H8V12H16V14ZM12 10H6V6H12V10ZM20 6H18V4H20V6ZM18 4H4V2H18V4Z']); // save
export const PxBatteryMedium = pixel('BatteryMedium', ['M4 5h14v2H4zm0 12h14v2H4zM2 7h2v10H2zm16-2h2v14h-2zm2 4h2v6h-2zM6 9h2v6H6zm4 0h2v6h-2z']); // battery-medium
export const PxArrowBigUp = pixel('ArrowBigUp', ['M8 21h8v-2H8zm0-2h2v-6H8zm-5-6h5v-2H3zm0-2h2V9H3zm2-2h2V7H5zm2-2h2V5H7zm2-2h2V3H9zm2-2h2V1h-2zm2 2h2V3h-2zm2 2h2V5h-2zm2 2h2V7h-2zm2 4h2V9h-2zm-3 0h3v-2h-3zm-2 6h2v-6h-2z']); // arrow-big-up
export const PxShield = pixel('Shield', ['M4 2h16v2H4zM2 4h2v10H2zm18 0h2v10h-2zM4 14h2v2H4zm2 2h2v2H6zm4 4h4v2h-4zm10-6h-2v2h2zm-2 2h-2v2h2zm-2 2h-2v2h2zm-6 0H8v2h2z']); // shield
