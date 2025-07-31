import React, { useState, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { UI_TEXT } from '../../constants';
import { BlogEntry } from '../../types';
import { useWindowVirtualization } from '../../hooks/useWindowVirtualization';

const BlogApp: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { isAdmin, blogPosts, language } = state;
    const text = UI_TEXT[language];

    const [newPost, setNewPost] = useState({ title: '', content: '', images: [] as string[] });
    const [editingPost, setEditingPost] = useState<BlogEntry | null>(null);
    const [imageUrlInput, setImageUrlInput] = useState('');
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Virtualization
    const { visibleItems, virtualizer } = useWindowVirtualization(blogPosts.length, {
        itemHeight: 450, // Average height of a post, can be adjusted
        containerRef: scrollContainerRef
    });

    const handleAddPost = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPost.title || !newPost.content) return;
        const post: BlogEntry = {
            id: Date.now().toString(),
            title: newPost.title,
            content: newPost.content,
            date: new Date().toISOString().split('T')[0],
            images: newPost.images
        };
        dispatch({ type: 'SET_BLOG_POSTS', payload: [post, ...blogPosts] });
        setNewPost({ title: '', content: '', images: [] });
    };
    
    const handleUpdatePost = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPost) return;
        dispatch({ type: 'UPDATE_BLOG_POST', payload: editingPost });
        setEditingPost(null);
    };

    const handleDeletePost = (id: string) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            dispatch({ type: 'DELETE_BLOG_POST', payload: id });
        }
    }
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const imagePromises = files.map(file => {
                return new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            });
            Promise.all(imagePromises).then(base64Images => {
                if(isEditing && editingPost) {
                    setEditingPost({...editingPost, images: [...editingPost.images, ...base64Images]});
                } else {
                    setNewPost(prev => ({...prev, images: [...prev.images, ...base64Images]}));
                }
            });
        }
    };

    const handleAddImageUrl = (isEditing: boolean) => {
        if (!imageUrlInput.trim()) return;
        try {
            new URL(imageUrlInput); // Basic URL validation
            if (isEditing && editingPost) {
                setEditingPost({ ...editingPost, images: [...editingPost.images, imageUrlInput.trim()] });
            } else {
                setNewPost(prev => ({ ...prev, images: [...prev.images, imageUrlInput.trim()] }));
            }
            setImageUrlInput('');
        } catch (_) {
            alert('Please enter a valid URL.');
        }
    };

    const controlStyle = "bg-white border-2 border-t-gray-700 border-l-gray-700 border-b-white border-r-white p-1 w-full outline-none focus:ring-1 focus:ring-blue-500 text-black font-sans";
    const buttonStyle = "font-sans bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black shadow-sm px-4 py-1 hover:bg-gray-300 active:border-t-black active:border-l-black active:border-b-white active:border-r-white text-black";

    const renderPost = (post: BlogEntry) => {
        const isEditing = editingPost?.id === post.id;
        
        if (isEditing) {
            return (
                 <form key={post.id} onSubmit={handleUpdatePost} className="blog-post-zine space-y-2">
                    <input type="text" value={editingPost.title} onChange={e => setEditingPost({...editingPost, title: e.target.value})} className={controlStyle} />
                    <textarea value={editingPost.content} onChange={e => setEditingPost({...editingPost, content: e.target.value})} className={`${controlStyle} h-32 resize-y`} />
                    
                    <div className='space-y-2'>
                        <label className={`${buttonStyle} cursor-pointer`}>
                            {text.addImages}
                            <input type="file" multiple accept="image/*" onChange={(e) => handleImageUpload(e, true)} className="hidden" />
                        </label>
                        <div className="flex gap-2">
                             <input 
                                type="text" 
                                placeholder={text.imageUrlPlaceholder}
                                value={imageUrlInput} 
                                onChange={(e) => setImageUrlInput(e.target.value)} 
                                className={controlStyle} 
                            />
                            <button type="button" onClick={() => handleAddImageUrl(true)} className={buttonStyle}>{text.add}</button>
                        </div>
                    </div>

                    <div className="flex gap-2 flex-wrap mt-2">
                        {editingPost.images.map((img, i) => (
                             <div key={i} className="relative group">
                                <img src={img} alt={`img-${i}`} className="w-24 h-24 object-cover border-2 border-t-gray-600 border-l-gray-600 border-b-white border-r-white" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!editingPost) return;
                                        const newImages = editingPost.images.filter((_, index) => index !== i);
                                        setEditingPost({ ...editingPost, images: newImages });
                                    }}
                                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    X
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                        <button type="button" onClick={() => setEditingPost(null)} className={buttonStyle}>{text.cancel}</button>
                        <button type="submit" className={`${buttonStyle} font-bold`}>{text.save}</button>
                    </div>
                 </form>
            );
        }
        
        return (
             <div key={post.id} className="blog-post-zine">
                <div className="flex justify-between items-start">
                     <h2 className='max-w-[80%]'>{post.title}</h2>
                    {isAdmin && 
                        <div className='flex gap-2'>
                            <button onClick={() => setEditingPost(post)} className="text-xs text-blue-600 hover:underline">[{text.edit}]</button>
                            <button onClick={() => handleDeletePost(post.id)} className="text-xs text-red-600 hover:underline">[{text.delete}]</button>
                        </div>
                    }
                </div>
                 <p className="text-xs text-gray-500 mb-2 italic">Posted on: {post.date}</p>
                <p className="mt-2 whitespace-pre-wrap blog-post-content">{post.content}</p>
                {post.images.length > 0 && (
                    <div className="mt-4 flex gap-2 flex-wrap">
                        {post.images.map((img, i) => <img key={i} src={img} alt={`img-${i}`} className="max-w-xs h-auto border-2 border-t-gray-600 border-l-gray-600 border-b-white border-r-white" />)}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="p-2 font-sans text-black bg-[#c0c0c0] h-full flex flex-col">
            {isAdmin && (
                <fieldset className="flex-shrink-0 border-2 border-t-gray-500 border-l-gray-500 border-b-white border-r-white p-3 bg-inherit">
                    <legend className="px-2 font-bold">{text.newPost}</legend>
                    <form onSubmit={handleAddPost} className="space-y-2">
                        <input
                            type="text"
                            placeholder={text.postTitle}
                            value={newPost.title}
                            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                            className={controlStyle}
                        />
                        <textarea
                            placeholder={text.postContent}
                            value={newPost.content}
                            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                            className={`${controlStyle} h-24 resize-y`}
                        />
                        <div className='space-y-2'>
                            <label className={`${buttonStyle} cursor-pointer`}>
                                {text.addImages}
                                <input type="file" multiple accept="image/*" onChange={(e) => handleImageUpload(e, false)} className="hidden" />
                            </label>
                            <div className="flex gap-2">
                                 <input 
                                    type="text" 
                                    placeholder={text.imageUrlPlaceholder}
                                    value={imageUrlInput} 
                                    onChange={(e) => setImageUrlInput(e.target.value)} 
                                    className={controlStyle} 
                                />
                                <button type="button" onClick={() => handleAddImageUrl(false)} className={buttonStyle}>{text.add}</button>
                            </div>
                        </div>
                         <div className="flex gap-2 flex-wrap mt-2">
                            {newPost.images.map((img, i) => <img key={i} src={img} alt={`img-${i}`} className="w-24 h-auto border-2 border-t-gray-600 border-l-gray-600 border-b-white border-r-white" />)}
                        </div>
                        <button type="submit" className={`${buttonStyle} w-full`}>{text.addPost}</button>
                    </form>
                </fieldset>
            )}

            <div ref={scrollContainerRef} className="flex-grow overflow-y-auto custom-scrollbar pr-4 -mr-4 py-2 mt-4 relative">
                <div style={virtualizer.style}>
                    {visibleItems.map(index => {
                        const post = blogPosts[index];
                        if (!post) return null;
                        return (
                             <div key={post.id} style={virtualizer.getItemStyle(index)} className="p-2">
                                {renderPost(post)}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default BlogApp;
