#!/usr/bin/env python3

import boto3
import os
import argparse
from tqdm import tqdm

def download_s3_bucket(bucket_name, prefix='', local_dir='.'):
    """
    Download all contents from an S3 bucket while preserving the directory structure.
    
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
                
                # Download the file
                s3_client.download_file(bucket_name, key, local_path)
                pbar.update(1)

def main():
    parser = argparse.ArgumentParser(description='Download all contents from an S3 bucket')
    parser.add_argument('bucket_name', help='Name of the S3 bucket')
    parser.add_argument('--prefix', default='', help='Optional prefix to filter objects')
    parser.add_argument('--local-dir', default='.', help='Local directory to save files to')
    
    args = parser.parse_args()
    
    try:
        download_s3_bucket(args.bucket_name, args.prefix, args.local_dir)
        print(f"\nDownload completed successfully to {args.local_dir}")
    except Exception as e:
        print(f"Error: {str(e)}")
        exit(1)

if __name__ == '__main__':
    main() 