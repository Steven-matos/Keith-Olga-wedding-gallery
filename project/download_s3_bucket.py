#!/usr/bin/env python3

import boto3
import os
import argparse
from tqdm import tqdm
from PIL import Image
import io

def convert_to_jpeg(image_data):
    """
    Convert image data to JPEG format.
    
    Args:
        image_data (bytes): Raw image data
        
    Returns:
        bytes: JPEG image data
    """
    try:
        img = Image.open(io.BytesIO(image_data))
        if img.mode in ('RGBA', 'LA'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[-1])
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        output = io.BytesIO()
        img.save(output, format='JPEG', quality=95)
        return output.getvalue()
    except Exception as e:
        print(f"Warning: Could not convert image: {str(e)}")
        return image_data

def download_s3_bucket(bucket_name, prefix='', local_dir='photo'):
    """
    Download all contents from an S3 bucket while preserving the directory structure.
    Convert images to JPEG format.
    
    Args:
        bucket_name (str): Name of the S3 bucket
        prefix (str): Optional prefix to filter objects
        local_dir (str): Local directory to save files to
    """
    # Initialize S3 client
    s3_client = boto3.client('s3')
    
    # List all objects in the bucket with the given prefix
    paginator = s3_client.get_paginator('list_objects_v2')
    pages = paginator.paginate(Bucket=bucket_name, Prefix=prefix)
    
    # Get total number of objects for progress bar
    total_objects = 0
    for page in pages:
        if 'Contents' in page:
            total_objects += len(page['Contents'])
    
    # Reset paginator for actual download
    pages = paginator.paginate(Bucket=bucket_name, Prefix=prefix)
    
    # Download each object
    with tqdm(total=total_objects, desc="Downloading files") as pbar:
        for page in pages:
            if 'Contents' not in page:
                continue
                
            for obj in page['Contents']:
                # Get the object key (path in S3)
                key = obj['Key']
                
                # Skip if it's a directory (ends with /)
                if key.endswith('/'):
                    continue
                
                # Create local path
                local_path = os.path.join(local_dir, key)
                
                # Create directory if it doesn't exist
                os.makedirs(os.path.dirname(local_path), exist_ok=True)
                
                # Get the file extension
                _, ext = os.path.splitext(key.lower())
                
                # Download the file
                if ext in ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']:
                    # For images, download to memory first
                    response = s3_client.get_object(Bucket=bucket_name, Key=key)
                    image_data = response['Body'].read()
                    
                    # Convert to JPEG
                    jpeg_data = convert_to_jpeg(image_data)
                    
                    # Save as JPEG
                    new_path = os.path.splitext(local_path)[0] + '.jpg'
                    with open(new_path, 'wb') as f:
                        f.write(jpeg_data)
                else:
                    # For non-image files, download directly
                    s3_client.download_file(bucket_name, key, local_path)
                
                pbar.update(1)

def main():
    parser = argparse.ArgumentParser(description='Download all contents from an S3 bucket and convert images to JPEG')
    parser.add_argument('bucket_name', help='Name of the S3 bucket')
    parser.add_argument('--prefix', default='', help='Optional prefix to filter objects')
    parser.add_argument('--local-dir', default='./photo', help='Local directory to save files to')
    
    args = parser.parse_args()
    
    try:
        download_s3_bucket(args.bucket_name, args.prefix, args.local_dir)
        print(f"\nDownload completed successfully to {args.local_dir}")
    except Exception as e:
        print(f"Error: {str(e)}")
        exit(1)

if __name__ == '__main__':
    main() 