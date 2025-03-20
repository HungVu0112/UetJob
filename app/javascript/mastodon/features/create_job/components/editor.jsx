import React, { useMemo } from "react";
import ReactQuill from "react-quill";
import DOMPurify from 'dompurify';

const Editor = ({ value, onChange, placeholder, toolbarOptions, readOnly=false }) => {
    // Sử dụng useMemo để tối ưu hóa việc tạo modules
    const modules = useMemo(() => ({
        toolbar: toolbarOptions || [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            ['clean']
        ]
    }), [toolbarOptions]);

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet',
        'color', 'background'
    ];

    if (readOnly) {
        return (
            <div 
                className="quill-content ql-editor ql-snow"
                dangerouslySetInnerHTML={{ 
                    __html: DOMPurify.sanitize(value || '') 
                }} 
            />
        );
    }

    return (
        <ReactQuill
            value={value || ''}
            onChange={onChange}
            modules={modules}
            formats={formats}
            placeholder={placeholder}
            theme="snow"
        />
    );
}

export default Editor;