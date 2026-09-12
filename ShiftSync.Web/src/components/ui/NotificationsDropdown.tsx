// // import { useGetMyNotificationsQuery, useMarkAllNotificationsAsReadMutation } from "@/store/apis";
// import { Menu, Transition } from "@headlessui/react";
// import { Fragment, useEffect, useState } from "react";
// // import { Notification } from "@/types";
// import { useNavigate } from "react-router-dom";
// // import { notificationService } from "@/api/notification.service";
// interface NotificationsDropdownProps {
//     user: any;
// }

// export default function NotificationsDropdown({ user }: NotificationsDropdownProps) {
//     const navigate = useNavigate();
//     const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();
//     const { data: notificationsData } = useGetMyNotificationsQuery();
//     const [realtimeNotifications, setRealtimeNotifications] = useState<Notification[]>([]);

//     const mergedNotifications = (() => {
//         const apiNotifications = notificationsData?.data ?? [];
//         const seen = new Set<string>();
//         const result: Notification[] = [];
//         for (const n of [...realtimeNotifications, ...apiNotifications]) {
//             if (!seen.has(n.id)) {
//                 seen.add(n.id);
//                 result.push(n);
//             }
//         }
//         return result;
//     })();

//     const hasNotifications = mergedNotifications.some((n) => !n.isRead);

//     useEffect(() => {
//         if (!user?.access_token) return;

//         notificationService.connect(user.access_token);

//         const unsubscribe = notificationService.listenForNotifications((newNotification: Notification) => {
//             setRealtimeNotifications((prev) => [newNotification, ...prev]);
//         });

//         return () => {
//             unsubscribe();
//         };
//     }, [user?.access_token]);

//     const handleMarkAllRead = async () => {
//         try {
//             await markAllAsRead().unwrap();
//             setRealtimeNotifications([]);
//         } catch (err) {
//             console.error("Failed to mark notifications as read:", err);
//         }
//     };

//     const getTypeColorClass = (type: string | number) => {
//         const typeStr = typeof type === 'number'
//             ? ['', 'info', 'success', 'warning', 'critical'][type] ?? 'info'
//             : type;
//         switch (typeStr?.toLowerCase()) {
//             case "success": return "text-emerald-400";
//             case "warning": return "text-amber-400";
//             case "critical": return "text-rose-500 font-bold";
//             default: return "text-sky-400";
//         }
//     };

//     return (
//         <Menu as="div" className="relative">
//             <Menu.Button className="w-10 h-10 flex items-center justify-center relative hover:bg-white/5 rounded-xl transition-colors group">
//                 <span className="material-symbols-outlined text-white/60 text-xl group-hover:text-white transition-colors">
//                     notifications
//                 </span>
//                 {hasNotifications && (
//                     <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-yellow-400 rounded-full border-2 border-[#12131a] shadow-[0_0_10px_rgba(250,204,21,0.5)]"></span>
//                 )}
//             </Menu.Button>
//             <Transition
//                 as={Fragment}
//                 enter="transition ease-out duration-200"
//                 enterFrom="transform opacity-0 scale-95 -translate-y-2"
//                 enterTo="transform opacity-100 scale-100 translate-y-0"
//                 leave="transition ease-in duration-75"
//                 leaveFrom="transform opacity-100 scale-100 translate-y-0"
//                 leaveTo="transform opacity-0 scale-95 -translate-y-2"
//             >
//                 <Menu.Items className="absolute right-0 bg-[#12131a] w-80 origin-top-right border border-white/10 rounded-lg overflow-hidden focus:outline-none z-50 shadow-2xl">
//                     <div className="p-4 border-b border-white/5 bg-white/5">
//                         <div className="flex items-center justify-between">
//                             <h3 className="text-sm font-bold text-white tracking-wide">
//                                 Notifications
//                             </h3>
//                             <div className="flex items-center gap-2">
//                                 {hasNotifications && (
//                                     <>
//                                         <span className="bg-yellow-400/20 text-yellow-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
//                                             NEW
//                                         </span>
//                                         <button
//                                             onClick={(e) => { e.stopPropagation(); handleMarkAllRead(); }}
//                                             className="text-[10px] text-white/40 hover:text-white/80 transition-colors uppercase tracking-wider font-semibold"
//                                         >
//                                             Mark all read
//                                         </button>
//                                     </>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                     <div className="max-h-96 overflow-y-auto divide-y divide-white/5">
//                         {mergedNotifications.length === 0 ? (
//                             <div className="p-8 text-center flex flex-col items-center gap-3">
//                                 <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
//                                     <span className="material-symbols-outlined text-white/20 text-2xl">
//                                         notifications_off
//                                     </span>
//                                 </div>
//                                 <p className="text-white/40 text-xs font-medium">
//                                     You're all caught up!
//                                 </p>
//                             </div>
//                         ) : (
//                             mergedNotifications.map((item) => (
//                                 <div key={item.id} className={`p-4 hover:bg-white/[0.02] transition-colors flex flex-col gap-1 ${!item.isRead ? 'border-l-2 border-l-yellow-400/60' : ''}`}>
//                                     <div className="flex items-start justify-between gap-2">
//                                         <span className={`text-xs font-semibold ${getTypeColorClass(item.type)}`}>
//                                             {item.title}
//                                         </span>
//                                         <span className="text-[9px] text-white/30 whitespace-nowrap pt-0.5">
//                                             {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
//                                         </span>
//                                     </div>
//                                     <p className="text-white/70 text-xs leading-relaxed break-words">
//                                         {item.message}
//                                     </p>
//                                 </div>
//                             ))
//                         )}
//                     </div>
//                     <div className="p-3 bg-white/5 text-center border-t border-white/5">
//                         <button
//                             onClick={() => navigate("/dashboard/notifications")}
//                             className="text-[10px] uppercase tracking-widest font-bold text-yellow-400 hover:text-yellow-300 transition-colors"
//                         >
//                             View All Activity
//                         </button>
//                     </div>
//                 </Menu.Items>
//             </Transition>
//         </Menu>
//     );
// }